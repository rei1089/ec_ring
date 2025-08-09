-- サンプル店舗データ
INSERT INTO public.shops (name, address, country) VALUES
('ドン・キホーテ 秋葉原店', '東京都千代田区外神田4-3-3', 'JP'),
('ドン・キホーテ 渋谷店', '東京都渋谷区宇田川町28-6', 'JP'),
('ドン・キホーテ 新宿店', '東京都新宿区歌舞伎町1-16-5', 'JP'),
('無印良品 有楽町店', '東京都千代田区有楽町2-8-1', 'JP'),
('無印良品 新宿店', '東京都新宿区新宿3-1-1', 'JP'),
('ユニクロ 銀座店', '東京都中央区銀座6-9-5', 'JP'),
('ユニクロ 渋谷店', '東京都渋谷区神南1-7-7', 'JP'),
('ローソン 秋葉原駅前店', '東京都千代田区外神田1-17-6', 'JP'),
('セブン-イレブン 新宿東口店', '東京都新宿区新宿3-1-1', 'JP'),
('ファミリーマート 渋谷センター街店', '東京都渋谷区宇田川町26-1', 'JP');

-- サンプル商品データ（より多様なカテゴリー）
INSERT INTO public.products (title, brand, category, description, weight_g, cover_image_url) VALUES
-- お菓子・スイーツ
('抹茶クッキー', 'お菓子の森', 'お菓子', '京都産抹茶を使用した上品なクッキー', 150, 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400'),
('抹茶チョコレート', '明治', 'お菓子', '濃厚な抹茶味のチョコレート', 80, 'https://images.unsplash.com/photo-1549007994-cb92b5b5b5b5?w=400'),
('抹茶ラテミックス', 'AGF', '飲料', 'お湯で溶くだけで本格抹茶ラテ', 200, 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400'),
('抹茶アイスクリーム', 'ハーゲンダッツ', '冷菓', '濃厚な抹茶味のアイスクリーム', 300, 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400'),
('抹茶ケーキ', '不二家', 'お菓子', 'しっとりとした抹茶ケーキ', 250, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400'),

-- お土産・雑貨
('東京ばな奈', '東京ばな奈', 'お土産', '東京限定のバナナ味のお菓子', 120, 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400'),
('雷おこし', '雷おこし本舗', 'お土産', '浅草名物の雷おこし', 200, 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=400'),
('東京スカイツリークッキー', '東京スカイツリー', 'お土産', '東京スカイツリー限定クッキー', 150, 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400'),

-- 化粧品・スキンケア
('SK-II 化粧水', 'SK-II', '化粧品', '高級化粧水', 230, 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400'),
('資生堂 洗顔フォーム', '資生堂', '化粧品', 'マイルドな洗顔フォーム', 120, 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400'),
('DHC リップクリーム', 'DHC', '化粧品', '保湿リップクリーム', 15, 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400'),

-- 飲料
('伊藤園 おーいお茶', '伊藤園', '飲料', '緑茶', 500, 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400'),
('コカ・コーラ', 'コカ・コーラ', '飲料', '炭酸飲料', 350, 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400'),
('カルビー ポテトチップス', 'カルビー', 'スナック', 'ポテトチップス', 85, 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400'),

-- その他
('ユニクロ Tシャツ', 'ユニクロ', '衣類', 'カジュアルTシャツ', 150, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400'),
('無印良品 ノート', '無印良品', '文具', 'シンプルなノート', 100, 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400'),
('ローソン おにぎり', 'ローソン', '食品', '鮭おにぎり', 120, 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400');

-- サンプルバーコードデータ（実際のJAN-13コードは架空）
INSERT INTO public.barcodes (product_id, code_value) VALUES
-- お菓子・スイーツ
((SELECT id FROM public.products WHERE title = '抹茶クッキー'), '4901234567890'),
((SELECT id FROM public.products WHERE title = '抹茶チョコレート'), '4901234567891'),
((SELECT id FROM public.products WHERE title = '抹茶ラテミックス'), '4901234567892'),
((SELECT id FROM public.products WHERE title = '抹茶アイスクリーム'), '4901234567893'),
((SELECT id FROM public.products WHERE title = '抹茶ケーキ'), '4901234567894'),

-- お土産・雑貨
((SELECT id FROM public.products WHERE title = '東京ばな奈'), '4901234567895'),
((SELECT id FROM public.products WHERE title = '雷おこし'), '4901234567896'),
((SELECT id FROM public.products WHERE title = '東京スカイツリークッキー'), '4901234567897'),

-- 化粧品・スキンケア
((SELECT id FROM public.products WHERE title = 'SK-II 化粧水'), '4901234567898'),
((SELECT id FROM public.products WHERE title = '資生堂 洗顔フォーム'), '4901234567899'),
((SELECT id FROM public.products WHERE title = 'DHC リップクリーム'), '4901234567900'),

-- 飲料
((SELECT id FROM public.products WHERE title = '伊藤園 おーいお茶'), '4901234567901'),
((SELECT id FROM public.products WHERE title = 'コカ・コーラ'), '4901234567902'),
((SELECT id FROM public.products WHERE title = 'カルビー ポテトチップス'), '4901234567903'),

-- その他
((SELECT id FROM public.products WHERE title = 'ユニクロ Tシャツ'), '4901234567904'),
((SELECT id FROM public.products WHERE title = '無印良品 ノート'), '4901234567905'),
((SELECT id FROM public.products WHERE title = 'ローソン おにぎり'), '4901234567906');

-- サンプルオファーデータ
INSERT INTO public.offers (shop_id, product_id, price_jpy) VALUES
-- お菓子・スイーツ
((SELECT id FROM public.shops WHERE name = 'ドン・キホーテ 秋葉原店'), (SELECT id FROM public.products WHERE title = '抹茶クッキー'), 580),
((SELECT id FROM public.shops WHERE name = 'ドン・キホーテ 秋葉原店'), (SELECT id FROM public.products WHERE title = '抹茶チョコレート'), 380),
((SELECT id FROM public.shops WHERE name = 'ドン・キホーテ 渋谷店'), (SELECT id FROM public.products WHERE title = '抹茶ラテミックス'), 680),
((SELECT id FROM public.shops WHERE name = 'ドン・キホーテ 新宿店'), (SELECT id FROM public.products WHERE title = '抹茶アイスクリーム'), 480),
((SELECT id FROM public.shops WHERE name = '無印良品 有楽町店'), (SELECT id FROM public.products WHERE title = '抹茶ケーキ'), 780),

-- お土産・雑貨
((SELECT id FROM public.shops WHERE name = 'ドン・キホーテ 秋葉原店'), (SELECT id FROM public.products WHERE title = '東京ばな奈'), 1200),
((SELECT id FROM public.shops WHERE name = 'ドン・キホーテ 渋谷店'), (SELECT id FROM public.products WHERE title = '雷おこし'), 800),
((SELECT id FROM public.shops WHERE name = 'ドン・キホーテ 新宿店'), (SELECT id FROM public.products WHERE title = '東京スカイツリークッキー'), 1500),

-- 化粧品・スキンケア
((SELECT id FROM public.shops WHERE name = 'ドン・キホーテ 秋葉原店'), (SELECT id FROM public.products WHERE title = 'SK-II 化粧水'), 15000),
((SELECT id FROM public.shops WHERE name = 'ドン・キホーテ 渋谷店'), (SELECT id FROM public.products WHERE title = '資生堂 洗顔フォーム'), 1200),
((SELECT id FROM public.shops WHERE name = 'ドン・キホーテ 新宿店'), (SELECT id FROM public.products WHERE title = 'DHC リップクリーム'), 500),

-- 飲料
((SELECT id FROM public.shops WHERE name = 'ローソン 秋葉原駅前店'), (SELECT id FROM public.products WHERE title = '伊藤園 おーいお茶'), 150),
((SELECT id FROM public.shops WHERE name = 'セブン-イレブン 新宿東口店'), (SELECT id FROM public.products WHERE title = 'コカ・コーラ'), 180),
((SELECT id FROM public.shops WHERE name = 'ファミリーマート 渋谷センター街店'), (SELECT id FROM public.products WHERE title = 'カルビー ポテトチップス'), 200),

-- その他
((SELECT id FROM public.shops WHERE name = 'ユニクロ 銀座店'), (SELECT id FROM public.products WHERE title = 'ユニクロ Tシャツ'), 1500),
((SELECT id FROM public.shops WHERE name = '無印良品 有楽町店'), (SELECT id FROM public.products WHERE title = '無印良品 ノート'), 300),
((SELECT id FROM public.shops WHERE name = 'ローソン 秋葉原駅前店'), (SELECT id FROM public.products WHERE title = 'ローソン おにぎり'), 250);
