<?php

require_once __DIR__ . '/../src/config/Database.php';

use Kureva\Config\Database;

try {
    $db = Database::getConnection();
    echo "Seeding database...\n";

    // Disable foreign keys temporarily to truncate safely
    $driver = $db->getAttribute(PDO::ATTR_DRIVER_NAME);
    if ($driver === 'sqlite') {
        $db->exec('PRAGMA foreign_keys = OFF;');
    } else {
        $db->exec('SET FOREIGN_KEY_CHECKS = 0;');
    }

    // Clear tables
    $db->exec("DELETE FROM users");
    $db->exec("DELETE FROM user_profiles");
    $db->exec("DELETE FROM sessions");
    $db->exec("DELETE FROM wishlists");
    $db->exec("DELETE FROM wishlist_items");
    $db->exec("DELETE FROM occasions");
    $db->exec("DELETE FROM occasion_wishlists");
    $db->exec("DELETE FROM gift_reservations");
    $db->exec("DELETE FROM activity_logs");

    if ($driver === 'sqlite') {
        $db->exec('PRAGMA foreign_keys = ON;');
    } else {
        $db->exec('SET FOREIGN_KEY_CHECKS = 1;');
    }

    // Insert demo user
    $passwordHash = password_hash('kureva123', PASSWORD_DEFAULT);
    $stmtUser = $db->prepare("INSERT INTO users (id, username, email, password_hash) VALUES (1, 'sarah', 'sarah@kureva.com', ?)");
    $stmtUser->execute([$passwordHash]);

    // Insert profile
    $stmtProfile = $db->prepare("
        INSERT INTO user_profiles (user_id, name, bio, avatar_url) 
        VALUES (1, 'Sarah Ade', 'Collecting little things that make life nicer.', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop')
    ");
    $stmtProfile->execute();

    // Insert wishlists
    $birthdayUuid = 'b17d3b2c-61cb-4a6c-9be2-4467c6bd5e6b';
    $homeUuid = 'c8b671a1-f3b1-419b-b0b3-4f9de78a6ffb';

    $stmtW = $db->prepare("
        INSERT INTO wishlists (id, uuid, user_id, name, description, cover_image, visibility) 
        VALUES (?, ?, 1, ?, ?, ?, ?)
    ");
    $stmtW->execute([
        1, 
        $birthdayUuid, 
        'Birthday Wishes', 
        'A few things I\'d absolutely love this year ♡', 
        'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800', 
        'public'
    ]);
    
    $stmtW->execute([
        2, 
        $homeUuid, 
        'Home & Cozy', 
        'Setting up my quiet reading nook.', 
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800', 
        'unlisted'
    ]);

    // Insert wishlist items
    $stmtItem = $db->prepare("
        INSERT INTO wishlist_items (id, wishlist_id, name, image_url, product_url, store, price, currency, description, notes, priority, quantity) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    
    // Birthday items
    $stmtItem->execute([
        1, 1, 'Sony WH-1000XM4 Headphones', 
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300', 
        'https://www.jumia.com.ng/sony-wh-1000xm4-wireless-noise-cancelling-headphones-54321.html', 
        'Jumia', 249.00, 'USD', 
        'Wireless noise cancelling headphones, over-ear style.', 
        'Black color preferred. I would use these daily for work.', 'must_have', 1
    ]);
    $stmtItem->execute([
        2, 1, 'Kindle Paperwhite (16 GB)', 
        'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=300', 
        'https://www.amazon.com/Kindle-Paperwhite-16-GB-adjustable/dp/B09TWDYSVP', 
        'Amazon', 139.00, 'USD', 
        '6.8-inch display, adjustable warm light, up to 10 weeks of battery.', 
        'To help me hit my reading goals!', 'really_want', 1
    ]);
    $stmtItem->execute([
        3, 1, 'Matcha Whisk & Bowl Set', 
        'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=300', 
        'https://www.amazon.com/Bamboo-Matcha-Whisk-Set/dp/B07Z8K1C7L', 
        'Amazon', 19.99, 'USD', 
        'Traditional bamboo whisk (chasen) and handmade ceramic bowl.', 
        'For my morning rituals.', 'nice_to_have', 1
    ]);

    // Home items
    $stmtItem->execute([
        4, 2, 'Ceramic V60 Coffee Dripper', 
        'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300', 
        'https://www.amazon.com/Hario-Ceramic-Coffee-Dripper-White/dp/B000A2YV8Y', 
        'Amazon', 25.00, 'USD', 
        'Classic white ceramic pour-over dripper size 02.', 
        'Preferably white.', 'really_want', 1
    ]);
    $stmtItem->execute([
        5, 2, 'Linen Throw Blanket', 
        'https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?w=300', 
        'https://www.shopify.com/', 
        'Shopify', 85.00, 'USD', 
        '100% French flax linen throw blanket, soft and breathable.', 
        'Oatmeal/neutral color.', 'nice_to_have', 1
    ]);

    // Insert occasions
    $bdayOccasionUuid = 'e15d8f34-11cf-4f90-a7d2-7c870ffbe3f1';
    $weddingOccasionUuid = 'f98e21a2-9b2f-410a-b21a-bcde78f192aa';

    $stmtO = $db->prepare("
        INSERT INTO occasions (id, uuid, user_id, name, type, date, description, cover_image, location, visibility) 
        VALUES (?, ?, 1, ?, ?, ?, ?, ?, ?, ?)
    ");
    
    $todayPlus30 = date('Y-m-d', strtotime('+30 days'));
    $todayPlus60 = date('Y-m-d', strtotime('+60 days'));

    $stmtO->execute([
        1, 
        $bdayOccasionUuid, 
        'Sarah\'s 27th Birthday', 
        'birthday', 
        $todayPlus30, 
        'I\'d love to celebrate another year of life with my favorite people.', 
        'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800', 
        'Cozy Restaurant, Lagos', 
        'public'
    ]);
    
    $stmtO->execute([
        2, 
        $weddingOccasionUuid, 
        'Our Wedding Registry', 
        'wedding', 
        $todayPlus60, 
        'A little celebration. A lot of love.', 
        'https://images.unsplash.com/photo-1519741497674-611481863552?w=800', 
        'Outdoor Garden, Lekki', 
        'unlisted'
    ]);

    // Link occasions to wishlists
    $stmtLink = $db->prepare("INSERT INTO occasion_wishlists (occasion_id, wishlist_id) VALUES (?, ?)");
    $stmtLink->execute([1, 1]); // Link Bday occasion to Birthday wishlist
    $stmtLink->execute([2, 2]); // Link Wedding occasion to Home wishlist

    // Seed one reservation as a sample
    $stmtRes = $db->prepare("
        INSERT INTO gift_reservations (wishlist_item_id, name, email, status) 
        VALUES (2, 'Kenji', 'kenji@example.com', 'reserved')
    ");
    $stmtRes->execute();

    echo "Database seeded successfully with demo data!\n";
} catch (Exception $e) {
    die("Seeding failed: " . $e->getMessage() . "\n");
}
