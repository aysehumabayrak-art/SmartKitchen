# 🍳 SmartKitchen (Akıllı Mutfak Yönetim Platformu)

SmartKitchen, modern mutfakların ihtiyaç duyduğu yemek tarifi yönetimi, kiler/buzdolabı malzeme takibi, kalori/besin değeri hesaplama ve dinamik alışveriş listesi oluşturma gibi süreçleri tek bir çatı altında toplayan, web tabanlı akıllı bir mutfak yönetim platformudur.

Gıda israfını önlemek, mutfak harcamalarını optimize etmek ve "Bugün ne pişirsem?" sorusuna pratik çözümler sunmak amacıyla geliştirilmiştir.

---

## 📖 İçindekiler
- [Özellikler](#-özellikler)
- [Proje Mimarisi ve Ekranlar](#-proje-mimarisi-ve-ekranlar)
- [Kullanılan Teknolojiler](#-kullanılan-teknolojiler)
- [Dosya Yapısı](#-dosya-yapısı)
- [Kurulum ve Çalıştırma](#-kurulum-ve-çalıştırma)
- [Geliştirme Yol Haritası (Roadmap)](#-geliştirme-yol-haritası-roadmap)
- [Katkıda Bulunma](#-katkıda-bulunma)
- [Lisans](#-lisans)

---

## 📌 Özellikler

### 🥗 1. Akıllı Tarif ve Yemek Yönetimi
- **Detaylı Tarif Detayları:** Malzeme listeleri, adım adım hazırlanış talimatları, pişirme/hazırlama süreleri ve porsiyon bilgisi.
- **Malzemeye Göre Tarif Arama:** Elinizde bulunan malzemeleri seçerek hızlıca yapabileceğiniz tarifleri filtreleme.
- **Kategori ve Diyet Filtreleme:** Vejetaryen, vegan, glutensiz veya tatlı/ana yemek gibi kategorilere göre filtreleme imkanı.

### 🧺 2. Kiler ve Buzdolabı Takibi
- **Envanter Yönetimi:** Mutfaktaki tüm gıda maddelerini miktar ve birim (kg, adet, litre vb.) bilgisiyle kaydetme.
- **Tazelik ve Son Kullanma Tarihi Uyarısı:** Bozulmaya yakın ürünleri öne çıkararak gıda israfını azaltma.
- **Stok Durum Grafikleri:** Kritik stok seviyesine düşen malzemeler için otomatik uyarı sistemi.

### 🛒 3. Otomatik ve Dinamik Alışveriş Listesi
- **Eksik Malzeme Entegrasyonu:** Seçilen tariflerde eksik olan malzemelerin tek tıkla alışveriş listesine aktarılması.
- **Kişiselleştirilebilir Listeler:** Manuel ürün ekleme, çıkarma ve tamamlanan ürünleri işaretleme (check-list) özelliği.
- **Bütçe ve Adet Takibi:** Alınacak ürünlerin tahmini maliyetlerini ve miktarlarını planlama.

### 📱 4. Modern Arayüz ve Kullanıcı Deneyimi
- **Tam Duyarlı (Responsive) Tasarım:** Masaüstü bilgisayarlar, tabletler ve mobil cihazlarda sorunsuz kullanım.
- **Kullanıcı Dostu Tasarım:** Minimalist, göz yormayan renk paleti ve sezgisel gezinme menüleri.
- **Çevrimdışı/Yerel Depolama:** Kullanıcı tercihlerinin ve verilerinin tarayıcıda (`LocalStorage`) güvenli şekilde saklanması.

---

## 🛠️ Kullanılan Teknolojiler

- **HTML5:** Semantic (anlamsal) etiketler kullanılarak oluşturulmuş, erişilebilirliği yüksek içerik yapısı.
- **CSS3:**
  - Modern düzen araçları (**Flexbox** ve **CSS Grid**) ile esnek sayfa yapıları.
  - Özel CSS değişkenleri (CSS Variables) ile kolay tema yönetimi.
  - Mobil öncelikli (Mobile-First) duyarlı tasarım yaklaşımları.
- **JavaScript (ES6+):**
  - Modüler ve temiz kod mimarisi.
  - Asenkron veri işleme (`Async/Await`, `Fetch API`).
  - Dinamik DOM manipülasyonu ve olay dinleyicileri (Event Listeners).

---

## 📂 Dosya Yapısı

```text
SmartKitchen/
│
├── index.html          # Uygulama ana giriş sayfası ve DOM yapısı
├── styles.css          # Genel stil kuralları, tema değişkenleri ve responsive kırılımlar
├── app.js              # Uygulama mantığı, veri yönetimi ve UI etkileşimleri
└── desktop.ini         # Sistem konfigürasyon dosyası
```

---

## 🚀 Kurulum ve Çalıştırma

Proje, herhangi bir harici bağımlılık veya derleme (build) adımı gerektirmediği için doğrudan tarayıcı üzerinde çalıştırılabilir.

### 1. Adım: Projeyi Klonlayın
```bash
git clone https://github.com/kullaniciadi/SmartKitchen.git
```

### 2. Adım: Proje Dizinine Geçin
```bash
cd SmartKitchen
```

### 3. Adım: Çalıştırın
- **Yöntem A (Doğrudan):** `index.html` dosyasına çift tıklayarak tercih ettiğiniz web tarayıcısında açın.
- **Yöntem B (Canlı Sunucu - Önerilen):** Visual Studio Code kullanıyorsanız, `Live Server` eklentisini yükleyip `index.html` üzerinde **"Open with Live Server"** seçeneğini kullanın.

---

## 🗺️ Geliştirme Yol Haritası (Roadmap)

- [ ] **Kullanıcı Hesapları ve Oturum Açma:** Firebase/Auth entegrasyonu ile kişisel veri senkronizasyonu.
- [ ] **Yapay Zeka Destekli Öneri Sistemi:** Kilerdeki malzemelere göre AI tabanlı tarif oluşturucu.
- [ ] **Besin Değeri Hesaplayıcı:** Günlük kalori, protein, karbonhidrat ve yağ makro takibi.
- [ ] **Sosyal Paylaşım:** Kullanıcıların kendi tariflerini toplulukla paylaşabilmesi.
- [ ] **Karanlık Mod (Dark Mode):** Gece kullanımı için koyu tema seçeneği.

---

## 🤝 Katkıda Bulunma

SmartKitchen açık kaynaklı bir projedir ve topluluk katkılarına tamamen açıktır!

1. Projeyi **Fork** edin.
2. Yeni bir özellik dalı oluşturun: `git checkout -b ozellik/HarikaOzellik`
3. Değişikliklerinizi kaydedin: `git commit -m 'feat: Harika yeni özellik eklendi'`
4. Dalınıza yükleyin: `git push origin ozellik/HarikaOzellik`
5. Bir **Pull Request (PR)** açın.

---

## 📄 Lisans

Bu proje **MIT Lisansı** altında lisanslanmıştır. Daha fazla detay için `LICENSE` dosyasına göz atabilirsiniz.
