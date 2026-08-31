<?php

namespace Kureva\Services;

class ProductParserService {

    public static function parse(string $url): array {
        $html = self::fetchSafeUrl($url);
        if (!$html) {
            return self::emptyResult($url);
        }

        // Clean up formatting
        $dom = new \DOMDocument();
        libxml_use_internal_errors(true);
        $dom->loadHTML('<?xml encoding="utf-8" ?>' . $html, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
        libxml_clear_errors();

        $xpath = new \DOMXPath($dom);

        // Try JSON-LD first
        $jsonLdData = self::parseJsonLd($xpath);
        
        // Try OpenGraph
        $ogData = self::parseOpenGraph($xpath);

        // Merge and resolve defaults
        $title = $jsonLdData['title'] ?: $ogData['title'] ?: self::extractTitleTag($dom);
        $image = $jsonLdData['image'] ?: $ogData['image'] ?: self::extractFirstImage($xpath);
        $price = $jsonLdData['price'] ?: $ogData['price'] ?: self::extractPriceRegex($html);
        $currency = $jsonLdData['currency'] ?: $ogData['currency'] ?: 'USD';
        $description = $jsonLdData['description'] ?: $ogData['description'] ?: '';
        $store = self::detectStore($url, $xpath);

        return [
            'name' => $title ?: 'External Product',
            'image_url' => $image,
            'product_url' => $url,
            'store' => $store,
            'price' => $price ? floatval($price) : null,
            'currency' => $currency,
            'description' => substr($description, 0, 500)
        ];
    }

    private static function parseJsonLd(\DOMXPath $xpath): array {
        $result = ['title' => null, 'image' => null, 'price' => null, 'currency' => null, 'description' => null];
        $scripts = $xpath->query('//script[@type="application/ld+json"]');
        
        foreach ($scripts as $script) {
            $json = json_decode($script->nodeValue, true);
            if (!$json) continue;

            // Handle nested graphs
            $items = isset($json['@graph']) ? $json['@graph'] : [$json];
            foreach ($items as $item) {
                if (isset($item['@type']) && strtolower($item['@type']) === 'product') {
                    $result['title'] = $item['name'] ?? null;
                    $result['description'] = $item['description'] ?? null;
                    
                    if (isset($item['image'])) {
                        $result['image'] = is_array($item['image']) ? ($item['image'][0] ?? null) : $item['image'];
                    }

                    if (isset($item['offers'])) {
                        $offers = $item['offers'];
                        if (isset($offers['@type']) && strtolower($offers['@type']) === 'aggregateoffer') {
                            $result['price'] = $offers['lowPrice'] ?? $offers['highPrice'] ?? null;
                            $result['currency'] = $offers['priceCurrency'] ?? null;
                        } else {
                            $result['price'] = $offers['price'] ?? null;
                            $result['currency'] = $offers['priceCurrency'] ?? null;
                        }
                    }
                    break 2;
                }
            }
        }
        return $result;
    }

    private static function parseOpenGraph(\DOMXPath $xpath): array {
        $result = ['title' => null, 'image' => null, 'price' => null, 'currency' => null, 'description' => null];

        $metaTags = [
            'title' => ['og:title', 'twitter:title'],
            'image' => ['og:image', 'og:image:secure_url', 'twitter:image'],
            'price' => ['product:price:amount', 'og:price:amount', 'price'],
            'currency' => ['product:price:currency', 'og:price:currency', 'currency'],
            'description' => ['og:description', 'twitter:description', 'description']
        ];

        foreach ($metaTags as $field => $names) {
            foreach ($names as $name) {
                $query = sprintf('//meta[@property="%1$s" or @name="%1$s"]', $name);
                $nodes = $xpath->query($query);
                if ($nodes->length > 0) {
                    $result[$field] = $nodes->item(0)->getAttribute('content');
                    break;
                }
            }
        }

        return $result;
    }

    private static function extractTitleTag(\DOMDocument $dom): ?string {
        $titles = $dom->getElementsByTagName('title');
        if ($titles->length > 0) {
            return trim($titles->item(0)->nodeValue);
        }
        return null;
    }

    private static function extractFirstImage(\DOMXPath $xpath): ?string {
        // Fallback to first large image
        $images = $xpath->query('//img[@src]');
        foreach ($images as $img) {
            $src = $img->getAttribute('src');
            if (preg_match('/\.(jpg|jpeg|png|webp)/i', $src)) {
                return $src;
            }
        }
        return null;
    }

    private static function extractPriceRegex(string $html): ?string {
        // Regex fallback for price matching like $99.99 or 99,99 €
        if (preg_match('/\$([0-9]+(?:\.[0-9]{2})?)/', $html, $matches)) {
            return $matches[1];
        }
        return null;
    }

    private static function detectStore(string $url, \DOMXPath $xpath): string {
        $parsed = parse_url($url);
        $host = isset($parsed['host']) ? strtolower($parsed['host']) : '';
        $host = preg_replace('/^www\./', '', $host);

        // Check OpenGraph site_name
        $siteNodes = $xpath->query('//meta[@property="og:site_name"]');
        if ($siteNodes->length > 0) {
            return trim($siteNodes->item(0)->getAttribute('content'));
        }

        return ucfirst(explode('.', $host)[0]);
    }

    private static function emptyResult(string $url): array {
        $parsed = parse_url($url);
        $host = isset($parsed['host']) ? strtolower($parsed['host']) : 'External Store';
        return [
            'name' => 'New Product',
            'image_url' => '',
            'product_url' => $url,
            'store' => ucfirst(explode('.', $host)[0]),
            'price' => null,
            'currency' => 'USD',
            'description' => ''
        ];
    }

    /**
     * SSRF Safe URL Fetcher
     */
    private static function fetchSafeUrl(string $url): ?string {
        $maxRedirects = 5;
        $currentUrl = $url;

        for ($i = 0; $i < $maxRedirects; $i++) {
            $parsed = parse_url($currentUrl);
            if (!$parsed || !isset($parsed['host'])) {
                return null;
            }

            $host = $parsed['host'];
            $ips = gethostbynamel($host);
            if (!$ips) {
                return null;
            }

            foreach ($ips as $ip) {
                if (self::isPrivateIp($ip)) {
                    error_log("SSRF Blocked: Attempted to fetch private IP $ip");
                    return null;
                }
            }

            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $currentUrl);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false); // Handle redirects manually to validate IP
            curl_setopt($ch, CURLOPT_TIMEOUT, 10);
            curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) KurevaPreviewer/1.0');
            
            $output = curl_exec($ch);
            $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            
            if ($statusCode >= 300 && $statusCode < 400) {
                $redirectUrl = curl_getinfo($ch, CURLINFO_REDIRECT_URL);
                if (!$redirectUrl) {
                    $header = curl_exec($ch);
                    if (preg_match('/Location:\s*(\S+)/i', $header, $matches)) {
                        $redirectUrl = $matches[1];
                    }
                }

                if (!$redirectUrl) {
                    curl_close($ch);
                    break;
                }

                // Handle relative paths
                if (strpos($redirectUrl, '/') === 0) {
                    $redirectUrl = ($parsed['scheme'] ?? 'https') . '://' . $host . $redirectUrl;
                }

                $currentUrl = $redirectUrl;
                curl_close($ch);
                continue;
            }

            curl_close($ch);
            return $output;
        }

        return null;
    }

    private static function isPrivateIp(string $ip): bool {
        // IPv4 validation
        $ipLong = ip2long($ip);
        if ($ipLong === false) {
            return true; // If we can't parse it, treat as unsafe
        }

        $privateRanges = [
            '127.0.0.0' => '127.255.255.255', // Loopback
            '10.0.0.0' => '10.255.255.255',   // Class A private
            '172.16.0.0' => '172.31.255.255', // Class B private
            '192.168.0.0' => '192.168.255.255', // Class C private
            '169.254.0.0' => '169.254.255.255', // Link local
            '224.0.0.0' => '239.255.255.255', // Multicast
            '0.0.0.0' => '0.255.255.255',     // Local network
        ];

        foreach ($privateRanges as $start => $end) {
            if ($ipLong >= ip2long($start) && $ipLong <= ip2long($end)) {
                return true;
            }
        }

        return false;
    }
}
