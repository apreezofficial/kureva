<?php

namespace Kureva\Services;

class ProductParserService {

    public static function parse(string $url): array {
        $cleanUrl = trim($url);
        if (!filter_var($cleanUrl, FILTER_VALIDATE_URL)) {
            return self::emptyResult($cleanUrl);
        }

        $html = self::fetchSafeUrl($cleanUrl);
        if (!$html) {
            return self::emptyResult($cleanUrl);
        }

        // Clean up DOM formatting
        $dom = new \DOMDocument();
        libxml_use_internal_errors(true);
        $dom->loadHTML('<?xml encoding="utf-8" ?>' . $html, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
        libxml_clear_errors();

        $xpath = new \DOMXPath($dom);

        // 1. Try JSON-LD Structured Data
        $jsonLdData = self::parseJsonLd($xpath);
        
        // 2. Try Microdata (itemprop)
        $microdata = self::parseMicrodata($xpath);

        // 3. Try OpenGraph & Meta tags
        $ogData = self::parseOpenGraph($xpath);

        // 4. Try Embedded JavaScript / DataLayer (Jumia, Shopify, Amazon)
        $jsData = self::parseEmbeddedJs($html);

        // 5. Try DOM Specific Price Selectors (Amazon, Jumia, generic stores)
        $domPrice = self::extractDomPrice($xpath);

        // 6. Try Title Tag / H1
        $htmlTitle = self::extractTitleTag($dom, $xpath);
        $slugTitle = self::extractTitleFromSlug($cleanUrl);

        // Resolve best title
        $rawTitle = $jsonLdData['title'] 
            ?: $microdata['title'] 
            ?: $ogData['title'] 
            ?: $jsData['title'] 
            ?: $htmlTitle 
            ?: $slugTitle 
            ?: 'Product from Link';
        $title = self::cleanTitle($rawTitle);
        if (empty($title) || strlen($title) < 3) {
            $title = self::cleanTitle($slugTitle ?: 'Product from Link');
        }

        // Resolve best image
        $image = $jsonLdData['image'] 
            ?: $microdata['image'] 
            ?: $ogData['image'] 
            ?: $jsData['image'] 
            ?: self::extractFirstImage($xpath);
        if ($image && strpos($image, '//') === 0) {
            $image = 'https:' . $image;
        }

        // Resolve best price (hierarchy)
        $rawPrice = $jsonLdData['price']
            ?: $microdata['price']
            ?: $ogData['price']
            ?: $domPrice
            ?: $jsData['price']
            ?: self::extractPriceRegex($html);
        
        $price = self::sanitizePrice($rawPrice);

        // Resolve best currency
        $currency = $jsonLdData['currency'] 
            ?: $microdata['currency'] 
            ?: $ogData['currency'] 
            ?: $jsData['currency'] 
            ?: self::detectCurrency($cleanUrl, $html);

        // Resolve description & store
        $description = $jsonLdData['description'] ?: $ogData['description'] ?: $microdata['description'] ?: '';
        $store = self::detectStore($cleanUrl, $xpath);

        return [
            'name' => $title,
            'image_url' => $image ?: '',
            'product_url' => $cleanUrl,
            'store' => $store,
            'price' => $price,
            'currency' => $currency,
            'description' => substr(trim(strip_tags($description)), 0, 500)
        ];
    }

    private static function parseJsonLd(\DOMXPath $xpath): array {
        $result = ['title' => null, 'image' => null, 'price' => null, 'currency' => null, 'description' => null];
        $scripts = $xpath->query('//script[@type="application/ld+json"]');
        
        foreach ($scripts as $script) {
            $rawContent = trim($script->nodeValue);
            $json = json_decode($rawContent, true);
            if (!$json) continue;

            $items = [];
            if (isset($json['@graph']) && is_array($json['@graph'])) {
                $items = $json['@graph'];
            } elseif (is_array($json) && array_is_list($json)) {
                $items = $json;
            } else {
                $items = [$json];
            }

            foreach ($items as $item) {
                if (!is_array($item)) continue;
                $type = strtolower($item['@type'] ?? '');
                
                if (in_array($type, ['product', 'individualproduct', 'itempage', 'productmodel', 'productgroup'])) {
                    if (!empty($item['name'])) $result['title'] = $item['name'];
                    if (!empty($item['description'])) $result['description'] = $item['description'];
                    
                    if (!empty($item['image'])) {
                        if (is_array($item['image'])) {
                            $first = $item['image'][0] ?? null;
                            $result['image'] = is_array($first) ? ($first['url'] ?? $first['contentUrl'] ?? null) : $first;
                        } else {
                            $result['image'] = $item['image'];
                        }
                    }

                    if (!empty($item['offers'])) {
                        $offers = $item['offers'];
                        if (is_array($offers)) {
                            // Offers array
                            $targetOffer = array_is_list($offers) ? ($offers[0] ?? []) : $offers;
                            if (isset($targetOffer['price'])) {
                                $result['price'] = $targetOffer['price'];
                            } elseif (isset($targetOffer['lowPrice'])) {
                                $result['price'] = $targetOffer['lowPrice'];
                            } elseif (isset($targetOffer['highPrice'])) {
                                $result['price'] = $targetOffer['highPrice'];
                            }

                            if (!empty($targetOffer['priceCurrency'])) {
                                $result['currency'] = $targetOffer['priceCurrency'];
                            }
                        }
                    }

                    if ($result['title'] || $result['price']) {
                        break 2;
                    }
                }
            }
        }
        return $result;
    }

    private static function parseMicrodata(\DOMXPath $xpath): array {
        $result = ['title' => null, 'image' => null, 'price' => null, 'currency' => null, 'description' => null];

        // Itemprop price
        $priceNodes = $xpath->query('//*[@itemprop="price"]/@content | //*[@itemprop="price"]/text() | //*[@itemprop="lowPrice"]/@content');
        if ($priceNodes && $priceNodes->length > 0) {
            foreach ($priceNodes as $node) {
                $val = trim($node->nodeValue);
                if (!empty($val) && preg_match('/[0-9]/', $val)) {
                    $result['price'] = $val;
                    break;
                }
            }
        }

        // Itemprop currency
        $currNodes = $xpath->query('//*[@itemprop="priceCurrency"]/@content | //*[@itemprop="priceCurrency"]/text()');
        if ($currNodes && $currNodes->length > 0) {
            $result['currency'] = trim($currNodes->item(0)->nodeValue);
        }

        // Itemprop name
        $nameNodes = $xpath->query('//*[@itemprop="name"]/@content | //*[@itemprop="name"]/text()');
        if ($nameNodes && $nameNodes->length > 0) {
            $result['title'] = trim($nameNodes->item(0)->nodeValue);
        }

        // Itemprop image
        $imageNodes = $xpath->query('//*[@itemprop="image"]/@src | //*[@itemprop="image"]/@content');
        if ($imageNodes && $imageNodes->length > 0) {
            $result['image'] = trim($imageNodes->item(0)->nodeValue);
        }

        return $result;
    }

    private static function parseOpenGraph(\DOMXPath $xpath): array {
        $result = ['title' => null, 'image' => null, 'price' => null, 'currency' => null, 'description' => null];

        $metaTags = [
            'title' => ['og:title', 'twitter:title', 'title'],
            'image' => ['og:image', 'og:image:secure_url', 'twitter:image', 'twitter:image:src', 'image'],
            'price' => ['product:price:amount', 'og:price:amount', 'price', 'twitter:data1', 'product:sale_price:amount'],
            'currency' => ['product:price:currency', 'og:price:currency', 'currency'],
            'description' => ['og:description', 'twitter:description', 'description']
        ];

        foreach ($metaTags as $field => $names) {
            foreach ($names as $name) {
                $query = sprintf('//meta[@property="%1$s" or @name="%1$s" or @itemprop="%1$s"]', $name);
                $nodes = $xpath->query($query);
                if ($nodes && $nodes->length > 0) {
                    $content = $nodes->item(0)->getAttribute('content');
                    if (!empty($content)) {
                        $result[$field] = trim($content);
                        break;
                    }
                }
            }
        }

        return $result;
    }

    private static function parseEmbeddedJs(string $html): array {
        $result = ['title' => null, 'image' => null, 'price' => null, 'currency' => null];

        // 1. Jumia & modern stores universal_variable / dataLayer / ecommerce object
        if (preg_match('/(?:unit_price|unit_sale_price|price|prices|amount)["\']?\s*:\s*["\']?([0-9]{1,7}(?:\.[0-9]{2})?)["\']?/i', $html, $matches)) {
            $result['price'] = $matches[1];
        }

        // 2. data-price or data-prc attributes in raw HTML
        if (!$result['price'] && preg_match('/data-(?:prc|price|amount|product-price)=["\']?([0-9]+(?:\.[0-9]{2})?)["\']?/i', $html, $matches)) {
            $result['price'] = $matches[1];
        }

        // 3. Shopify product object
        if (preg_match('/var\s+meta\s*=\s*({.*?});/s', $html, $matches)) {
            $shopifyMeta = json_decode($matches[1], true);
            if (isset($shopifyMeta['product']['price'])) {
                $result['price'] = floatval($shopifyMeta['product']['price']) / 100;
            }
        }

        return $result;
    }

    private static function extractDomPrice(\DOMXPath $xpath): ?string {
        // Targeted queries for popular stores
        $queries = [
            // Jumia price selectors
            '//span[contains(@class, "-prxs")]/text()',
            '//div[contains(@class, "prc")]/text()',
            '//span[contains(@class, "-fs24")]/text()',
            '//span[contains(@class, "-b") and contains(@class, "-ltr")]/text()',
            // Amazon price selectors
            '//span[contains(@class, "apexPriceToPay")]//span[contains(@class, "a-offscreen")]/text()',
            '//span[@id="priceblock_ourprice"]/text()',
            '//span[@id="priceblock_dealprice"]/text()',
            '//span[contains(@class, "a-price")]//span[contains(@class, "a-offscreen")]/text()',
            // Generic price classes
            '//*[contains(@class, "product-price")]/text()',
            '//*[contains(@class, "current-price")]/text()',
            '//*[contains(@class, "price-box")]/text()',
            '//*[contains(@class, "sale-price")]/text()',
        ];

        foreach ($queries as $q) {
            $nodes = $xpath->query($q);
            if ($nodes && $nodes->length > 0) {
                foreach ($nodes as $node) {
                    $text = trim($node->nodeValue);
                    if (preg_match('/[0-9]/', $text)) {
                        // Clean currency symbols from text
                        $cleaned = preg_replace('/[^0-9.,]/', '', $text);
                        if (!empty($cleaned)) {
                            return $cleaned;
                        }
                    }
                }
            }
        }

        return null;
    }

    private static function extractPriceRegex(string $html): ?string {
        // 1. Jumia & Nigerian Naira symbol ₦ or &#8358;
        if (preg_match('/(?:₦|&#8358;|NGN|\bN\b)\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})?|[0-9]+)/i', $html, $matches)) {
            return $matches[1];
        }

        // 2. Dollar, Euro, Pound, Yen symbols
        if (preg_match('/(?:\$|€|£|¥)\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})?|[0-9]+(?:\.[0-9]{2})?)/i', $html, $matches)) {
            return $matches[1];
        }

        return null;
    }

    private static function sanitizePrice($price): ?float {
        if ($price === null || $price === '') return null;
        if (is_numeric($price)) {
            $val = floatval($price);
            return ($val > 0 && $val < 100000000) ? $val : null;
        }

        $str = strval($price);
        // Replace commas
        $str = str_replace(',', '', $str);
        // Extract numeric float
        if (preg_match('/([0-9]+(?:\.[0-9]{1,2})?)/', $str, $matches)) {
            $val = floatval($matches[1]);
            return ($val > 0 && $val < 100000000) ? $val : null;
        }

        return null;
    }

    private static function extractTitleTag(\DOMDocument $dom, \DOMXPath $xpath): ?string {
        // Try h1 with product class first
        $h1s = $xpath->query('//h1');
        if ($h1s && $h1s->length > 0) {
            $h1Text = trim($h1s->item(0)->textContent);
            if (strlen($h1Text) > 3 && strlen($h1Text) < 200) {
                return $h1Text;
            }
        }

        $titles = $dom->getElementsByTagName('title');
        if ($titles->length > 0) {
            return trim($titles->item(0)->textContent);
        }
        return null;
    }

    private static function cleanTitle(string $title): string {
        $cleaned = trim($title);
        // Remove trailing URLs, html extensions, and trailing product codes
        $cleaned = preg_replace('/https?:\/\/\S*/i', '', $cleaned);
        $cleaned = preg_replace('/https?:?$/i', '', $cleaned);
        $cleaned = preg_replace('/\.html?.*$/i', '', $cleaned);
        $cleaned = preg_replace('/[-_]\s*[0-9]{5,}.*$/i', '', $cleaned);
        $cleaned = preg_replace('/\s+[0-9]{5,}.*$/i', '', $cleaned);
        // Remove trailing store suffix like " | Jumia Nigeria", " - Amazon.com", " : Target"
        $cleaned = preg_replace('/\s*[-|–—:]\s*(Jumia.*|Amazon.*|AliExpress.*|eBay.*|Zara.*|ASOS.*|Shopify.*|Walmart.*|Target.*)$/i', '', $cleaned);
        return trim($cleaned) ?: $title;
    }

    private static function extractTitleFromSlug(string $url): string {
        $cleanUrl = strtok($url, '?#');
        $parsed = parse_url($cleanUrl);
        $path = $parsed['path'] ?? '';
        $segments = array_filter(explode('/', $path));
        if (empty($segments)) return '';

        // Pick longest slug segment
        $bestSegment = '';
        foreach (array_reverse($segments) as $seg) {
            $segClean = preg_replace('/\.html?$/i', '', $seg);
            if (strlen($segClean) > strlen($bestSegment) && !preg_match('/^(dp|product|item|p|c|category|buy|shop)$/i', $segClean)) {
                $bestSegment = $segClean;
            }
        }

        if ($bestSegment) {
            // Remove numeric product IDs from end
            $bestSegment = preg_replace('/[-_][0-9]{4,}$/', '', $bestSegment);
            $bestSegment = preg_replace('/[0-9]{6,}$/', '', $bestSegment);
            $words = preg_split('/[-_]+/', $bestSegment);
            $words = array_filter($words, function($w) {
                return !empty($w) && !preg_match('/^https?:?$/i', $w) && !preg_match('/^html$/i', $w);
            });
            $words = array_map('ucfirst', $words);
            return implode(' ', $words);
        }

        return '';
    }

    private static function extractFirstImage(\DOMXPath $xpath): ?string {
        $queries = [
            '//img[@id="landingImage"]/@src',
            '//img[@id="imgBlkFront"]/@src',
            '//img[contains(@class, "-fw -fh")]/@data-src',
            '//img[contains(@class, "product")]/@src',
            '//img[contains(@class, "gallery")]/@src',
            '//img[@data-src]/@data-src',
            '//img[@src]/@src'
        ];

        foreach ($queries as $q) {
            $nodes = $xpath->query($q);
            if ($nodes && $nodes->length > 0) {
                foreach ($nodes as $node) {
                    $src = $node->nodeValue;
                    if (preg_match('/\.(jpg|jpeg|png|webp)/i', $src) && !preg_match('/(logo|icon|loader|placeholder|spinner)/i', $src)) {
                        return $src;
                    }
                }
            }
        }
        return null;
    }

    private static function detectCurrency(string $url, string $html): string {
        $host = strtolower(parse_url($url, PHP_URL_HOST) ?? '');
        if (str_contains($host, '.ng') || str_contains($host, 'jumia.com.ng') || str_contains($host, 'konga.com') || str_contains($html, '₦') || str_contains($html, '&#8358;') || str_contains($html, 'NGN')) {
            return 'NGN';
        }
        if (str_contains($host, '.uk') || str_contains($host, '.co.uk') || str_contains($html, '£') || str_contains($html, 'GBP')) {
            return 'GBP';
        }
        if (str_contains($host, '.de') || str_contains($host, '.fr') || str_contains($host, '.es') || str_contains($html, '€') || str_contains($html, 'EUR')) {
            return 'EUR';
        }
        if (str_contains($host, '.jp') || str_contains($html, '¥') || str_contains($html, 'JPY')) {
            return 'JPY';
        }
        return 'USD';
    }

    private static function detectStore(string $url, \DOMXPath $xpath): string {
        $parsed = parse_url($url);
        $host = isset($parsed['host']) ? strtolower($parsed['host']) : '';
        $host = preg_replace('/^www\./', '', $host);

        // Check OpenGraph site_name
        $siteNodes = $xpath->query('//meta[@property="og:site_name"]/@content');
        if ($siteNodes && $siteNodes->length > 0) {
            $siteName = trim($siteNodes->item(0)->nodeValue);
            if (!empty($siteName)) {
                return $siteName;
            }
        }

        // Known stores
        if (str_contains($host, 'jumia')) return 'Jumia';
        if (str_contains($host, 'amazon')) return 'Amazon';
        if (str_contains($host, 'konga')) return 'Konga';
        if (str_contains($host, 'aliexpress')) return 'AliExpress';
        if (str_contains($host, 'shein')) return 'SHEIN';
        if (str_contains($host, 'asos')) return 'ASOS';
        if (str_contains($host, 'zara')) return 'Zara';
        if (str_contains($host, 'nike')) return 'Nike';
        if (str_contains($host, 'apple')) return 'Apple';
        if (str_contains($host, 'ebay')) return 'eBay';
        if (str_contains($host, 'walmart')) return 'Walmart';
        if (str_contains($host, 'target')) return 'Target';

        return ucfirst(explode('.', $host)[0]);
    }

    private static function emptyResult(string $url): array {
        $slugTitle = self::cleanTitle(self::extractTitleFromSlug($url));
        $parsed = parse_url($url);
        $host = isset($parsed['host']) ? strtolower($parsed['host']) : 'External Store';
        $store = self::detectStore($url, new \DOMXPath(new \DOMDocument()));

        return [
            'name' => $slugTitle ?: ($store ? "$store Product" : 'Gift Item'),
            'image_url' => '',
            'product_url' => $url,
            'store' => $store,
            'price' => null,
            'currency' => self::detectCurrency($url, ''),
            'description' => ''
        ];
    }

    /**
     * SSRF Safe URL Fetcher with modern browser headers, gzip/br auto-decompression, and redirect tracking
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
            $ips = @gethostbynamel($host);
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
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false);
            curl_setopt($ch, CURLOPT_TIMEOUT, 10);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
            curl_setopt($ch, CURLOPT_ENCODING, ''); // Automatically handles gzip, deflate, and br decompression!
            curl_setopt($ch, CURLOPT_COOKIEFILE, ''); // Enables in-memory cookie jar
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language: en-US,en;q=0.9',
                'Sec-Fetch-Dest: document',
                'Sec-Fetch-Mode: navigate',
                'Sec-Fetch-Site: none',
                'Sec-Fetch-User: ?1',
                'Upgrade-Insecure-Requests: 1'
            ]);
            
            $output = curl_exec($ch);
            $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            
            if ($statusCode >= 300 && $statusCode < 400) {
                $redirectUrl = curl_getinfo($ch, CURLINFO_REDIRECT_URL);
                if (!$redirectUrl && preg_match('/Location:\s*(\S+)/i', $output, $matches)) {
                    $redirectUrl = $matches[1];
                }

                if (!$redirectUrl) {
                    curl_close($ch);
                    break;
                }

                if (strpos($redirectUrl, '/') === 0) {
                    $redirectUrl = ($parsed['scheme'] ?? 'https') . '://' . $host . $redirectUrl;
                }

                $currentUrl = $redirectUrl;
                curl_close($ch);
                continue;
            }

            curl_close($ch);
            return ($statusCode >= 200 && $statusCode < 400 && $output) ? $output : null;
        }

        return null;
    }

    private static function isPrivateIp(string $ip): bool {
        $ipLong = ip2long($ip);
        if ($ipLong === false) {
            return true;
        }

        $privateRanges = [
            '127.0.0.0' => '127.255.255.255',
            '10.0.0.0' => '10.255.255.255',
            '172.16.0.0' => '172.31.255.255',
            '192.168.0.0' => '192.168.255.255',
            '169.254.0.0' => '169.254.255.255',
            '224.0.0.0' => '239.255.255.255',
            '0.0.0.0' => '0.255.255.255',
        ];

        foreach ($privateRanges as $start => $end) {
            if ($ipLong >= ip2long($start) && $ipLong <= ip2long($end)) {
                return true;
            }
        }

        return false;
    }
}
