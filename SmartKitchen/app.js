// ====== FIREBASE YAPILANDIRMASI ======
// LÜTFEN KENDİ FIREBASE PROJENİZİN BİLGİLERİNİ BURAYA GİRİN
const firebaseConfig = {
    apiKey: "BURAYA_API_KEY_YAZILACAK",
    authDomain: "PROJE-ADI.firebaseapp.com",
    databaseURL: "https://PROJE-ADI-default-rtdb.firebaseio.com",
    projectId: "PROJE-ADI",
    storageBucket: "PROJE-ADI.appspot.com",
    messagingSenderId: "SENDER_ID",
    appId: "APP_ID"
};
// =====================================

const IS_FIREBASE_READY = firebaseConfig.apiKey !== "BURAYA_API_KEY_YAZILACAK";

// Initialize Firebase (Compat version so it works on file:/// protocol without CORS error)
let db, pantryRef, shoppingRef;
if (IS_FIREBASE_READY) {
    firebase.initializeApp(firebaseConfig);
    db = firebase.database();
    pantryRef = db.ref('smartKitchen_pantry');
    shoppingRef = db.ref('smartKitchen_shopping');
}

document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Elements ---
    const loginForm = document.getElementById('login-form'), passwordInput = document.getElementById('password-input'), errorMessage = document.getElementById('error-message'), loginSection = document.getElementById('login-section'), mainSection = document.getElementById('main-section'), logoutBtn = document.getElementById('logout-btn');
    const addItemForm = document.getElementById('add-item-form'), itemNameInput = document.getElementById('item-name'), itemQuantityInput = document.getElementById('item-quantity'), itemUnitInput = document.getElementById('item-unit'), itemExpiryInput = document.getElementById('item-expiry'), pantryList = document.getElementById('pantry-list');
    const shoppingList = document.getElementById('shopping-list'), clearShoppingBtn = document.getElementById('clear-shopping-btn');
    const suggestBtn = document.getElementById('suggest-btn'), recipeList = document.getElementById('recipe-list');
    const searchRecipeForm = document.getElementById('search-recipe-form'), recipeSearchInput = document.getElementById('recipe-search-input');
    const expiringSection = document.getElementById('expiring-section'), expiringList = document.getElementById('expiring-list');

    // Default Date to Today
    itemExpiryInput.valueAsDate = new Date();

    const CORRECT_PASSWORD = 'mutfak123';
    const LOW_STOCK_THRESHOLD = 2;

    let pantryItems = [];
    let shoppingItems = [];
    let expiringItems = [];

    const RECIPES = [
        { id: 1, ad: "Menemen", kategori: "Kahvaltılık", malzemeler: ["yumurta", "domates", "biber"], yapilis: "Biber ve domatesi kavur, üzerine yumurta kır ve karıştır." },
        { id: 2, ad: "Peynirli Omlet", kategori: "Kahvaltılık", malzemeler: ["yumurta", "peynir", "tereyağı"], yapilis: "Yumurtayı çırp, tavada tereyağı ile pişir, arasına peynir ekle." },
        { id: 3, ad: "Sade Makarna", kategori: "Ana Yemek", malzemeler: ["makarna", "tuz", "su", "sıvı yağ"], yapilis: "Suyu kaynat, tuz ve sıvı yağ ekle. Makarnayı haşlayıp süz." },
        { id: 4, ad: "Salçalı Makarna", kategori: "Ana Yemek", malzemeler: ["makarna", "salça", "tereyağı", "nane"], yapilis: "Makarnayı haşla. Ayrı bir tavada tereyağı, salça ve naneyi kavurup makarnayla karıştır." },
        { id: 5, ad: "Tavuk Sote", kategori: "Ana Yemek", malzemeler: ["tavuk", "biber", "domates", "soğan", "sıvı yağ"], yapilis: "Tavukları kuşbaşı doğrayıp kavur. Soğan ve biberleri ekle, en son domatesle pişir." },
        { id: 6, ad: "Kısır", kategori: "Pratik Lezzet", malzemeler: ["bulgur", "salça", "soğan", "limon", "maydanoz"], yapilis: "Bulguru sıcak suyla ıslat. Kavrulmuş soğan, salça ve baharatları ekleyip yeşilliklerle harmanla." },
        { id: 7, ad: "Mercimek Çorbası", kategori: "Çorba", malzemeler: ["mercimek", "soğan", "patates", "havuç", "tereyağı"], yapilis: "Sebzeleri ve mercimeği kavur. Su ekleyip kaynat, piştikten sonra blenderdan geçir." },
        { id: 8, ad: "Kaşarlı Tost", kategori: "Kahvaltılık", malzemeler: ["ekmek", "kaşar", "tereyağı"], yapilis: "Ekmeğin arasına kaşar koy, üzerine tereyağı sürüp tost makinesinde kızart." },
        { id: 9, ad: "Patates Kızartması", kategori: "Atıştırmalık", malzemeler: ["patates", "sıvı yağ", "tuz"], yapilis: "Patatesleri dilimle, kızgın yağda altın sarısı olana kadar kızart, tuzla." },
        { id: 10, ad: "Kuru Fasulye", kategori: "Ana Yemek", malzemeler: ["kuru fasulye", "soğan", "salça", "sıvı yağ"], yapilis: "Fasulyeyi akşamdan ıslat. Soğan ve salçayı kavur, fasulyeyi ve suyu ekleyip kısık ateşte pişir." },
        { id: 11, ad: "Şehriyeli Pirinç Pilavı", kategori: "Ana Yemek", malzemeler: ["pirinç", "şehriye", "tereyağı", "su", "tuz"], yapilis: "Şehriyeyi tereyağında kavur. Yıkanmış pirinci ekle, kavur, sıcak su ve tuz ilave edip demle." },
        { id: 12, ad: "Köfte Patates", kategori: "Ana Yemek", malzemeler: ["kıyma", "soğan", "yumurta", "galeta unu", "patates", "sıvı yağ"], yapilis: "Kıymayı harç malzemeleriyle yoğurup şekil ver. Patatesleri dilimle. Fırında veya tavada pişir." },
        { id: 13, ad: "Domates Çorbası", kategori: "Çorba", malzemeler: ["domates", "un", "salça", "tereyağı", "süt"], yapilis: "Tereyağında unu kavur, salça ve rendelenmiş domatesi ekle. Süt ve suyu ilave edip kaynat." },
        { id: 14, ad: "Fırında Tavuk Patates", kategori: "Ana Yemek", malzemeler: ["tavuk", "patates", "salça", "soğan", "sarımsak", "sıvı yağ"], yapilis: "Tavuk ve patatesleri salçalı sosla harmanla. Fırın tepsisine dizip kızarana kadar pişir." },
        { id: 15, ad: "Yayla Çorbası", kategori: "Çorba", malzemeler: ["yoğurt", "pirinç", "yumurta", "un", "nane", "tereyağı"], yapilis: "Pirinci haşla. Yoğurt, yumurta ve unu çırpıp çorbaya terbiye yap. Üzerine naneli yağ gezdir." },
        { id: 16, ad: "Krep", kategori: "Kahvaltılık", malzemeler: ["süt", "un", "yumurta", "sıvı yağ", "tuz"], yapilis: "Tüm malzemeleri sıvı kıvamlı olana dek çırp. Hafif yağlanmış tavada arkalı önlü pişir." },
        { id: 17, ad: "Fırında Sütlaç", kategori: "Tatlı", malzemeler: ["süt", "pirinç", "şeker", "vanilya"], yapilis: "Pirinci haşla. Süt ve şekerle kaynat, vanilya ekle. Güveçlere pay edip fırında üstü kızarana dek pişir." },
        { id: 18, ad: "Muzlu Pankek", kategori: "Tatlı / Kahvaltı", malzemeler: ["muz", "süt", "yumurta", "un", "kabartma tozu"], yapilis: "Muzu ez, diğer malzemelerle pürüzsüz olana kadar karıştır. Tavada küçük porsiyonlar halinde pişir." },
        { id: 19, ad: "Mücver", kategori: "Ara Sıcak", malzemeler: ["kabak", "yumurta", "un", "dereotu", "sıvı yağ"], yapilis: "Kabağı rendele ve suyunu sık. Diğer malzemelerle karıştır, kızgın yağda kaşıkla dökerek kızart." },
        { id: 20, ad: "Ev Yapımı Hamburger", kategori: "Dünya Mutfağı", malzemeler: ["kıyma", "hamburger ekmeği", "domates", "marul", "kaşar"], yapilis: "Kıymadan ince köfteler yap ve pişir. Ekmeğin arasına köfte, kaşar ve yeşillikleri diz." },
        { id: 21, ad: "Spagetti Bolonez", kategori: "Dünya Mutfağı", malzemeler: ["makarna", "kıyma", "domates", "soğan", "sarımsak", "sıvı yağ"], yapilis: "Makarnayı haşla. Kıyma, soğan, sarımsak ve domatesi kavurarak sos yap ve makarnayla buluştur." },
        { id: 22, ad: "Pratik Pizza", kategori: "Dünya Mutfağı", malzemeler: ["un", "maya", "domates", "kaşar", "sucuk", "sıvı yağ"], yapilis: "Hamuru mayala ve aç. Üzerine domates sosu, kaşar ve sucuğu dizip fırına at." },
        { id: 23, ad: "Fajita", kategori: "Dünya Mutfağı", malzemeler: ["tavuk", "biber", "soğan", "sıvı yağ", "baharat"], yapilis: "Tavuk ve biberleri jülyen doğra, yüksek ateşte baharatlarla sotele." },
        { id: 24, ad: "Çılbır", kategori: "Pratik Lezzet", malzemeler: ["yoğurt", "yumurta", "sarımsak", "tereyağı", "pul biber"], yapilis: "Sarımsaklı yoğurdu hazırla. Yumurtayı sirkeli sıcak suda poşe yap. Tereyağlı biber gezdir." },
        { id: 25, ad: "Patates Salatası", kategori: "Salata / Meze", malzemeler: ["patates", "soğan", "maydanoz", "limon", "sıvı yağ"], yapilis: "Patatesleri haşlayıp küp doğra. Doğranmış soğan ve yeşilliklerle karıştır, yağ limon ekle." },
        { id: 26, ad: "Soslu Tavuk Kanat", kategori: "Ana Yemek", malzemeler: ["tavuk", "salça", "sarımsak", "sıvı yağ", "tuz"], yapilis: "Kanatları salçalı, sarımsaklı sos ile marine et. Fırında veya mangalda pişir." },
        { id: 27, ad: "Havuç Tarator", kategori: "Meze", malzemeler: ["havuç", "yoğurt", "sarımsak", "ceviz", "sıvı yağ"], yapilis: "Havuçları rendeleyip az yağda sotele. Soğuyunca sarımsaklı yoğurt ve cevizle karıştır." },
        { id: 28, ad: "Şakşuka", kategori: "Meze", malzemeler: ["patlıcan", "domates", "biber", "sarımsak", "sıvı yağ"], yapilis: "Patlıcan ve biberleri kızart. Üzerine sarımsaklı, domatesli sos dök." },
        { id: 29, ad: "Kakaolu Puding", kategori: "Tatlı", malzemeler: ["süt", "şeker", "kakao", "un", "vanilya"], yapilis: "Kuru malzemeleri tencereye al, sütü yavaşça ekleyerek koyulaşana dek karıştırarak pişir." },
        { id: 30, ad: "Mozaik Pasta", kategori: "Tatlı", malzemeler: ["bisküvi", "süt", "kakao", "tereyağı", "şeker"], yapilis: "Süt ve kakaolu sosu kaynatıp eritilen tereyağıyla karıştır. Kırık bisküvilerle harmanlayıp dondurucuya at." },
        { id: 31, ad: "Karnıyarık", kategori: "Türk Mutfağı", malzemeler: ["patlıcan", "kıyma", "soğan", "domates", "biber", "sarımsak", "salça", "sıvı yağ"], yapilis: "Patlıcanları alacalı soyup kızart. Kıymalı harcı hazırlayıp içlerine doldur, salçalı suyla pişir." },
        { id: 32, ad: "Mantı", kategori: "Türk Mutfağı", malzemeler: ["un", "yumurta", "kıyma", "soğan", "yoğurt", "sarımsak", "tereyağı", "nane", "pul biber"], yapilis: "Hamuru açıp ufak kareler kes, iç harcı koyup kapat. Haşlayıp üzerine sarımsaklı yoğurt ve sos gezdir." },
        { id: 33, ad: "Zeytinyağlı Yaprak Sarma", kategori: "Türk Mutfağı", malzemeler: ["asma yaprağı", "pirinç", "soğan", "zeytinyağı", "nane", "salça", "limon"], yapilis: "İç harcı pişir. Yaprakları sarıp tencereye diz, üzerine zeytinyağı ve limon dilimleri koyarak pişir." },
        { id: 34, ad: "İmam Bayıldı", kategori: "Türk Mutfağı", malzemeler: ["patlıcan", "soğan", "domates", "sarımsak", "zeytinyağı", "maydanoz"], yapilis: "Kızarmış patlıcanların içine bol zeytinyağında sotelediğin domatesli soğanlı harcı doldur, fırınla." },
        { id: 35, ad: "Ezogelin Çorbası", kategori: "Çorba", malzemeler: ["kırmızı mercimek", "bulgur", "pirinç", "soğan", "nane", "salça", "tereyağı", "sarımsak"], yapilis: "Mercimek, bulgur ve pirinci haşla. Tereyağında naneli salçalı sos yapıp çorbaya ilave et." },
        { id: 36, ad: "Hünkar Beğendi", kategori: "Türk Mutfağı", malzemeler: ["kuşbaşı et", "patlıcan", "süt", "un", "kaşar peyniri", "tereyağı", "domates", "salça"], yapilis: "Eti domatesli sosla yumuşayana kadar pişir. Közlenmiş patlıcanı un ve sütle beğendi yap, eti üzerine ekle." },
        { id: 37, ad: "İçli Köfte", kategori: "Türk Mutfağı", malzemeler: ["ince bulgur", "kıyma", "ceviz", "soğan", "salça", "sıvı yağ"], yapilis: "Soğanlı, cevizli kıyma harcını kavur. Bulguru yoğurarak hamur yap, içine cevizli harcı koyup haşla veya kızart." },
        { id: 38, ad: "Ali Nazik Kebap", kategori: "Türk Mutfağı", malzemeler: ["patlıcan", "yoğurt", "sarımsak", "kıyma", "tereyağı", "pul biber"], yapilis: "Közlenmiş patlıcanı sarımsaklı süzme yoğurtla karıştır. Üzerine kavrulmuş kıymalı tereyağlı harcı ekle." },
        { id: 39, ad: "Tas Kebabı", kategori: "Türk Mutfağı", malzemeler: ["kuşbaşı et", "soğan", "sarımsak", "patates", "domates", "salça", "sıvı yağ"], yapilis: "Eti kendi suyuyla kavur, soğan ve salçayı ekle, yavaş ateşte pişir. İsteyen içine veya yanına patates kızartması katabilir." },
        { id: 40, ad: "Zeytinyağlı Biber Dolması", kategori: "Türk Mutfağı", malzemeler: ["dolmalık biber", "pirinç", "soğan", "domates", "maydanoz", "salça", "nane", "zeytinyağı"], yapilis: "Pirinçli harcı hafif kavur. Biberlerin içini çok sıkıştırmadan doldurup tencereye diz, yarıya kadar suyla pişir." },
        { id: 41, ad: "Tarhana Çorbası", kategori: "Çorba", malzemeler: ["tarhana", "tereyağı", "salça", "sarımsak", "nane", "su"], yapilis: "Tarhanayı suda çöz. Tereyağında salça ve nane kavur, tarhanalı suyu ilave edip kaynayana kadar sürekli karıştır." },
        { id: 42, ad: "Kadınbudu Köfte", kategori: "Türk Mutfağı", malzemeler: ["kıyma", "pirinç", "soğan", "yumurta", "galeta unu", "sıvı yağ", "karabiber"], yapilis: "Kıymanın yarısını soğanla kavur. Haşlanmış pirinç ve çiğ kıymayla yoğur. Önce una sonra yumurtaya bulayıp kızart." },
        { id: 43, ad: "İrmik Helvası", kategori: "Tatlı", malzemeler: ["irmik", "tereyağı", "süt", "şeker", "çam fıstığı", "su"], yapilis: "Fıstıkları ve irmiği tereyağında rengi dönene kadar kavur. Sıcak sütlü şerbeti ilave edip çektir, dinlendir." },
        { id: 44, ad: "Zeytinyağlı Barbunya", kategori: "Zeytinyağlı", malzemeler: ["barbunya", "soğan", "havuç", "patates", "domates", "zeytinyağı", "şeker"], yapilis: "Soğan ve sebzeleri zeytinyağında sotele. Haşlanmış barbunya, az şeker ve su ekleyip kapağını kapatarak pişir." },
        { id: 45, ad: "Revani", kategori: "Tatlı", malzemeler: ["irmik", "un", "yumurta", "şeker", "yoğurt", "sıvı yağ", "kabartma tozu", "su"], yapilis: "Malzemeleri çırparak kek hamuru yap. Fırında pişince, daha önceden kaynatıp soğuttuğun şerbeti dök." },
        { id: 46, ad: "Muhlama (Mıhlama)", kategori: "Yöresel", malzemeler: ["mısır unu", "tereyağı", "kolot peyniri", "su", "tuz"], yapilis: "Tereyağını erit, mısır ununu biraz kavur. Suyu ekleyip koyulaştır, en son peyniri ekleyerek eriyip sünene dek pişir." },
        { id: 47, ad: "Güllaç", kategori: "Tatlı", malzemeler: ["güllaç yaprağı", "süt", "şeker", "ceviz", "gül suyu", "nar"], yapilis: "Sütü şekerle ısıtıp gül suyu ekle. Yaprakları tepsiye dizerken aralarına sütü kepçeyle dök, ortasına ceviz serpiştir." },
        { id: 48, ad: "Çiğ Köfte (Etsiz)", kategori: "Türk Mutfağı", malzemeler: ["esmer bulgur", "isot", "salça", "soğan", "sarımsak", "ceviz", "nar ekşisi", "sıvı yağ"], yapilis: "Tüm malzemeleri yumuşayana dek ince ince ve kuvvetlice yoğur. Marul, limon ve nar ekşisiyle sıkım köfteler servis et." },
        { id: 49, ad: "Su Böreği", kategori: "Hamur İşi", malzemeler: ["un", "yumurta", "beyaz peynir", "tereyağı", "maydanoz", "su", "tuz"], yapilis: "Hamuru yufka şeklinde açıp tek tek bol sıcak suda haşla ve soğuk suya daldır. Tepside aralarına peynir harcı koyarak fırınla." },
        { id: 50, ad: "Etli Ekmek", kategori: "Yöresel", malzemeler: ["un", "maya", "kıyma", "domates", "soğan", "biber", "tuz", "su"], yapilis: "Hamuru mayala, uzunlamasına aç. İçine suluca hazırlanan bol kıymalı harcı serip fırına ver." },
        { id: 51, ad: "Ev Yapımı Baklava", kategori: "Türk Tatlıları", malzemeler: ["baklavalık yufka", "tereyağı", "ceviz", "şeker", "su", "limon"], yapilis: "Yufkaların arasına eritilmiş tereyağı sürerek üst üste diz, ortaya bol ceviz serp. Dilimleyip fırınla, çıkarınca ılık şerbet dök." },
        { id: 52, ad: "Ev Yapımı Künefe", kategori: "Türk Tatlıları", malzemeler: ["tel kadayıf", "künefe peyniri", "tereyağı", "şeker", "su"], yapilis: "Kadayıfı tereyağıyla harmanlayıp tavaya yarısını bas. Üzerine peyniri yay, kalan kadayıfla kapat. İki yüzünü de kızartıp sıcak şerbeti dök." },
        { id: 53, ad: "Anne Sütlacı (Ocakta)", kategori: "Türk Tatlıları", malzemeler: ["süt", "pirinç", "şeker", "su"], yapilis: "Pirinci yumuşayana kadar suda haşla. Sütü ekleyip kaynat, şekerini ilave edip pirinçler helmelenene dek kısık ateşte pişir. Kâselere paylaştırıp tarçın ser." },
        { id: 54, ad: "Aşure", kategori: "Türk Tatlıları", malzemeler: ["aşurelik buğday", "nohut", "fasulye", "kayısı", "kuru üzüm", "şeker", "fındık", "ceviz"], yapilis: "Buğday ve bakliyatları ayrı ayrı haşla. Hepsini geniş bir tencerede birleştirip meyveleri ve şekeri katarak koyulaşana dek kaynat." },
        { id: 55, ad: "Kazandibi", kategori: "Türk Tatlıları", malzemeler: ["süt", "şeker", "pirinç unu", "nişasta", "tereyağı", "pudra şekeri"], yapilis: "Muhallebiyi pişir. Tepsinin dibini bolca yağlayıp pudra şekeri serp. Muhallebiyi döküp ocağın üstünde dibini hafifçe yak, soğuyunca rulo yap." },
        { id: 56, ad: "Yalancı Tavukgöğsü", kategori: "Türk Tatlıları", malzemeler: ["süt", "un", "şeker", "tereyağı", "vanilya"], yapilis: "Tereyağında unu hafif kokusu çıkana kadar kavur. Süt ve şekeri ekleyip sürekli çırparak muhallebi kıvamına getir, mikserle bolca çırparak sündür." },
        { id: 57, ad: "Şekerpare", kategori: "Türk Tatlıları", malzemeler: ["un", "irmik", "yumurta", "pudra şekeri", "tereyağı", "şeker", "su", "fındık"], yapilis: "Tereyağlı hamuru yoğurup yuvarlak şekil ver. Ortalarına fındık batırıp fırınla. Çıkar çıkmaz önceden hazırlanan ılık şerbeti üzerine dök." },
        { id: 58, ad: "Kabak Tatlısı", kategori: "Türk Tatlıları", malzemeler: ["balkabağı", "şeker", "tahin", "ceviz"], yapilis: "Kabakları iri doğrayıp geniş bir tencereye diz. Üzerini şekerle kaplayıp bir gece beklet. Kendi suyuyla kısık ateşte yumuşayana kadar pişir. Tahin ve cevizle servis et." },
        { id: 59, ad: "Ayva Tatlısı", kategori: "Türk Tatlıları", malzemeler: ["ayva", "şeker", "karanfil", "çubuk tarçın", "elma", "kaymak"], yapilis: "Ayvaları ikiye bölüp çekirdeklerini ayır. Tencereye diz, üzerine şeker, tarçın, karanfil ve ayva çekirdeklerini koyup kırmızı renk alana dek kısık ateşte pişir." },
        { id: 60, ad: "Lokma Tatlısı", kategori: "Türk Tatlıları", malzemeler: ["un", "maya", "şeker", "su", "sıvı yağ"], yapilis: "Sıvı kıvamlı mayalı bir hamur yoğurup mayalandır. Kızgın yağa kaşık yardımıyla küçük toplar dökerek kızart ve hemen soğuk şerbete at." },
        { id: 61, ad: "Keşkül", kategori: "Türk Tatlıları", malzemeler: ["süt", "şeker", "toz badem", "nişasta", "hindistan cevizi", "yumurta sarısı"], yapilis: "Tüm malzemeleri tencerede karıştırarak pürüzsüz hale getir. Ocağa alıp koyulaşana dek pişir. Kâselere döküp soğut, bademle süsle." },
        { id: 62, ad: "Zerde", kategori: "Türk Tatlıları", malzemeler: ["su", "pirinç", "şeker", "safran", "nişasta", "kuş üzümü", "dolmalık fıstık"], yapilis: "Pirinci suda haşla. Safranlı su, şeker ve nişastayı ilave ederek jöle kıvamına gelene kadar pişir. Üzerini fıstık ve narla süsle." },
        { id: 63, ad: "Sütlü Nuriye", kategori: "Türk Tatlıları", malzemeler: ["baklavalık yufka", "süt", "şeker", "fındık", "tereyağı"], yapilis: "Baklavalık yufkaları yağlayarak tepsiye diz, ortasına bol fındık dök. Fırınladıktan sonra su yerine süt ile hazırlanan kaynar şerbeti üzerine dök." },
        { id: 64, ad: "Kolay Ekmek Kadayıfı", kategori: "Türk Tatlıları", malzemeler: ["hazır ekmek kadayıfı", "şeker", "su", "limon", "kaymak"], yapilis: "Ekmek kadayıfını ılık suda biraz yumuşat. Karamelize edilmiş, limonlu koyu şerbeti üzerine yavaş yavaş dökerek ocakta çektir. Bol kaymakla servis yap." },
        { id: 65, ad: "Sütlü İrmik Tatlısı", kategori: "Türk Tatlıları", malzemeler: ["süt", "irmik", "şeker", "vanilya", "hindistan cevizi"], yapilis: "Süt, irmik ve şekeri tencereye alıp muhallebi kıvamına gelene dek pişir. Vanilyayı ekleyip borcama dök. Dolapta soğuttuktan sonra hindistan cevizi serperek kes." },
        { id: 66, ad: "Çoban Salata", kategori: "Salata / Meze", malzemeler: ["domates", "salatalık", "sivri biber", "kuru soğan", "maydanoz", "zeytinyağı", "limon"], yapilis: "Tüm sebzeleri küp küp doğrayıp karıştır. Üzerine zeytinyağı, limon suyu ve tuz gezdir." },
        { id: 67, ad: "Gavurdağı Salatası", kategori: "Salata / Meze", malzemeler: ["domates", "kuru soğan", "ceviz", "nar ekşisi", "zeytinyağı", "maydanoz", "salça"], yapilis: "Domates ve soğanı çok çok ince (kaşıkla yenecek gibi) doğra. Bol ceviz, zeytinyağı ve bol nar ekşisiyle harmanla." },
        { id: 68, ad: "Akdeniz Salatası", kategori: "Salata / Meze", malzemeler: ["akdeniz yeşillikleri", "çeri domates", "zeytin", "mısır", "beyaz peynir", "zeytinyağı", "limon"], yapilis: "Yeşillikleri kâseye al. Üzerine dilimlenmiş peynir, mısır, zeytin ve domatesleri diz. Soslayarak servis et." },
        { id: 69, ad: "Antalya Piyazı", kategori: "Salata / Meze", malzemeler: ["haşlanmış kuru fasulye", "kırmızı soğan", "maydanoz", "domates", "sirke", "tahin", "yumurta"], yapilis: "Tahin, sirke, sarımsak ve zeytinyağıyla özel bir sos çırp. Fasulyeyi soğanla harmanlayıp sosu dök, haşlanmış yumurta ile süsle." },
        { id: 70, ad: "Ezme Salata", kategori: "Salata / Meze", malzemeler: ["domates", "biber", "soğan", "sarımsak", "maydanoz", "acı pul biber", "nar ekşisi", "ceviz", "salça"], yapilis: "Tüm malzemeleri zırhla (veya robottan geçirerek) çok ince kıy. Baharatlar, zeytinyağı ve nar ekşisiyle iyice ezerek karıştır." },
        { id: 71, ad: "Ton Balıklı Salata", kategori: "Salata / Meze", malzemeler: ["göbek marul", "ton balığı", "mısır", "zeytin", "kapari", "zeytinyağı", "limon"], yapilis: "Marulları doğra, süzülmüş ton balığını üzerine tiftikleyerek yay. Mısır, zeytin ve limonlu sosla buluştur." },
        { id: 72, ad: "Tavuklu Sezar Salata", kategori: "Salata / Meze", malzemeler: ["göbek marul", "ızgara tavuk", "kruton ekmek", "parmesan peyniri", "sezar sos"], yapilis: "Tavuğu yağsız tavada ızgara yap. Marulların üzerine tavuk dilimlerini ve krutonları dizip Sezar sosla zenginleştir." },
        { id: 73, ad: "Rus Salatası", kategori: "Salata / Meze", malzemeler: ["patates", "havuç", "bezelye", "kornişon turşu", "mayonez"], yapilis: "Patates ve havuçları zar şeklinde doğrayıp bezelyeyle haşla. Kornişonları doğrayıp hepsi soğuyunca mayonezle bağla." },
        { id: 74, ad: "Roka Salatası", kategori: "Salata / Meze", malzemeler: ["roka", "çeri domates", "tulum peyniri", "ceviz", "zeytinyağı", "balzamik sirke"], yapilis: "Yıkanmış rokaları kâseye al. Üzerine iri parçalar halinde tulum peyniri, ceviz ve domatesleri at, balzamik sirke gezdir." },
        { id: 75, ad: "Yeşil Mercimek Salatası", kategori: "Salata / Meze", malzemeler: ["yeşil mercimek", "dereotu", "taze soğan", "kapya biber", "mısır", "zeytinyağı", "limon"], yapilis: "Mercimeği diri kalacak şekilde haşlayıp süz. İnce kıyılmış taze yeşillikler, köz biber ve zeytinyağlı-limonlu sosla harmanla." },
        { id: 76, ad: "Kırmızı Lahana Salatası (Lokanta Usulü)", kategori: "Salata / Meze", malzemeler: ["kırmızı lahana", "havuç", "sirke", "limon", "zeytinyağı", "tuz"], yapilis: "Lahanayı çok ince kıyıp tuz ve sirkeyle iyice ov. Havucu rendeleyip içine kat, limon ve yağ ekleyip beklet." },
        { id: 77, ad: "Yoğurtlu Köz Patlıcan Salatası", kategori: "Salata / Meze", malzemeler: ["patlıcan", "süzme yoğurt", "sarımsak", "zeytinyağı"], yapilis: "Közlenmiş patlıcanları kabuklarından ayırıp püre veya ince ezik haline getir. Sarımsaklı süzme yoğurtla karıştırıp üzerine yağ gezdir." },
        { id: 78, ad: "Yoğurtlu Semizotu Salatası", kategori: "Salata / Meze", malzemeler: ["semizotu", "süzme yoğurt", "sarımsak", "zeytinyağı", "ceviz"], yapilis: "Semizotu yapraklarını ayıkla. Sarımsaklı süzme yoğurtla karıştırıp üzerine dövülmüş ceviz ve zeytinyağı pul biber sosu gezdir." },
        { id: 79, ad: "Zeytinyağlı Ege Börülcesi", kategori: "Salata / Meze", malzemeler: ["taze börülce", "domates", "sarımsak", "zeytinyağı", "sirke", "limon"], yapilis: "Taze börülceleri uçlarını alıp bütün olarak haşla. Sıcakken üzerine bol zeytinyağı, ezilmiş sarımsak, sirke ve rendelenmiş domates dök." },
        { id: 80, ad: "Kaşık Salatası", kategori: "Salata / Meze", malzemeler: ["domates", "salatalık", "biber", "kuru soğan", "ceviz", "nar ekşisi", "ince bulgur"], yapilis: "Tüm sebzeleri (Gavurdağı gibi) zevkle ve çok ince doğrayıp içine az ıslatılmış ince bulgur karıştırarak bol nar ekşisiyle servis yap." }
    ];

    // --- Authentication ---
    const checkAuthStatus = () => {
        if (sessionStorage.getItem('smartKitchenAuth') === 'true') {
            showMainScreen();
        }
    };
    const showMainScreen = () => {
        loginSection.classList.remove('active');
        setTimeout(() => { loginSection.classList.add('hidden'); mainSection.classList.remove('hidden'); setTimeout(() => mainSection.classList.add('active'), 50); }, 400);
    };
    const showLoginScreen = () => {
        mainSection.classList.remove('active');
        setTimeout(() => { mainSection.classList.add('hidden'); loginSection.classList.remove('hidden'); setTimeout(() => loginSection.classList.add('active'), 50); }, 400);
    };

    const getValidPasswords = () => {
        const custom = localStorage.getItem('customSmartKitchenPwd');
        return custom ? [CORRECT_PASSWORD, custom] : [CORRECT_PASSWORD];
    };

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const validPasswords = getValidPasswords();
        if (validPasswords.includes(passwordInput.value)) {
            sessionStorage.setItem('smartKitchenAuth', 'true');
            errorMessage.classList.add('hidden');
            passwordInput.value = '';
            showMainScreen();
        } else {
            errorMessage.classList.remove('hidden');
            passwordInput.value = ''; passwordInput.focus();
        }
    });

    const registerSection = document.getElementById('register-section');
    const registerForm = document.getElementById('register-form');
    const createAccountBtn = document.getElementById('create-account-btn');
    const backToLoginBtn = document.getElementById('back-to-login-btn');

    if (createAccountBtn) {
        createAccountBtn.addEventListener('click', () => {
            loginSection.classList.remove('active');
            setTimeout(() => {
                loginSection.classList.add('hidden');
                registerSection.classList.remove('hidden');
                setTimeout(() => registerSection.classList.add('active'), 50);
            }, 400);
        });
    }

    if (backToLoginBtn) {
        backToLoginBtn.addEventListener('click', () => {
            registerSection.classList.remove('active');
            setTimeout(() => {
                registerSection.classList.add('hidden');
                loginSection.classList.remove('hidden');
                setTimeout(() => loginSection.classList.add('active'), 50);
            }, 400);
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newEmail = document.getElementById('reg-email-input').value;
            const newPwd = document.getElementById('reg-password-input').value;
            const consent = document.getElementById('reg-email-consent').checked;

            if (newPwd && newPwd.trim().length > 0) {
                localStorage.setItem('customSmartKitchenPwd', newPwd.trim());
                localStorage.setItem('smartKitchenUserEmail', newEmail);
                localStorage.setItem('smartKitchenEmailConsent', consent);

                alert(`Hesabınız başarıyla oluşturuldu!\nE-posta: ${newEmail}\nİzinler: Onaylandı\n\nArtık belirlediğiniz şifre ile sisteme giriş yapabilirsiniz.`);

                registerForm.reset();
                backToLoginBtn.click();
            }
        });
    }



    logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('smartKitchenAuth');
        showLoginScreen();
    });

    // --- LOAD INITIAL LOCAL STATE IF NO FIREBASE ---
    if (!IS_FIREBASE_READY) {
        // Fallback: Read from LocalStorage immediately
        pantryItems = JSON.parse(localStorage.getItem('smartKitchen_pantry')) || [];
        shoppingItems = JSON.parse(localStorage.getItem('smartKitchen_shopping')) || [];
        calculateExpiringItems();
        setTimeout(() => { renderLists(); resetRecipeList(); }, 50);
    }

    // --- FIREBASE LISTENERS (Only if setup) ---
    if (IS_FIREBASE_READY) {
        pantryRef.on('value', (snapshot) => {
            pantryItems = [];
            snapshot.forEach(child => {
                pantryItems.push({ id: child.key, ...child.val() });
            });
            calculateExpiringItems();
            renderLists();
            resetRecipeList();
        });

        shoppingRef.on('value', (snapshot) => {
            shoppingItems = [];
            snapshot.forEach(child => {
                shoppingItems.push({ id: child.key, ...child.val() });
            });
            renderLists();
        });
    }

    const saveLocalDB = () => {
        if (!IS_FIREBASE_READY) {
            localStorage.setItem('smartKitchen_pantry', JSON.stringify(pantryItems));
            localStorage.setItem('smartKitchen_shopping', JSON.stringify(shoppingItems));
            calculateExpiringItems();
            renderLists();
            resetRecipeList();
        }
    };

    // --- Expiry Logic ---
    function calculateExpiringItems() {
        expiringItems = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        pantryItems.forEach(item => {
            if (item.expiryDate && item.quantity > 0) {
                const expiry = new Date(item.expiryDate);
                const diffTime = expiry - today;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays <= 2) {
                    expiringItems.push({ ...item, diffDays });
                }
            }
        });

        if (expiringItems.length > 0) {
            expiringSection.classList.remove('hidden');
        } else {
            expiringSection.classList.add('hidden');
        }
    }

    const checkLowStock = (item, id) => {
        if (item.quantity < LOW_STOCK_THRESHOLD) {
            const existsInShopping = shoppingItems.find(s => s.name.toLowerCase() === item.name.toLowerCase());
            if (!existsInShopping) {
                if (IS_FIREBASE_READY) {
                    shoppingRef.push({ name: item.name, unit: item.unit }).catch(e => console.log(e));
                } else {
                    shoppingItems.push({ id: Date.now().toString() + Math.random(), name: item.name, unit: item.unit });
                    saveLocalDB();
                }
            }
        }
    };

    // --- CRUD Operations ---
    addItemForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = itemNameInput.value.trim();
        const quantity = parseFloat(itemQuantityInput.value);
        const unit = itemUnitInput.value;
        const expiryDate = itemExpiryInput.value;

        if (!name || isNaN(quantity)) return;

        const existingItem = pantryItems.find(i => i.name.toLowerCase() === name.toLowerCase());

        if (existingItem) {
            const newQty = existingItem.quantity + quantity;
            if (IS_FIREBASE_READY) {
                db.ref(`smartKitchen_pantry/${existingItem.id}`).update({
                    quantity: newQty, marginUnit: unit, expiryDate: expiryDate
                }).then(() => checkLowStock({ ...existingItem, quantity: newQty, unit, expiryDate }, existingItem.id)).catch(e => console.log(e));
            } else {
                existingItem.quantity = newQty;
                existingItem.unit = unit;
                existingItem.expiryDate = expiryDate;
                checkLowStock({ ...existingItem }, existingItem.id);
                saveLocalDB();
            }
        } else {
            const newItemInfo = { name, quantity, unit, expiryDate };
            if (IS_FIREBASE_READY) {
                pantryRef.push(newItemInfo).then((snap) => checkLowStock(newItemInfo, snap.key)).catch(e => console.log(e));
            } else {
                newItemInfo.id = Date.now().toString();
                pantryItems.push(newItemInfo);
                checkLowStock(newItemInfo, newItemInfo.id);
                saveLocalDB();
            }
        }

        itemNameInput.value = ''; itemQuantityInput.value = ''; itemExpiryInput.valueAsDate = new Date();
        itemNameInput.focus();
    });

    // Make functions global for inline onclick
    window.updateItem = (id, change) => {
        const item = pantryItems.find(i => i.id === id);
        if (item) {
            let increment = change;
            if (item.unit === 'Gram' && change !== 0) increment = change > 0 ? 50 : -50;
            else if (item.unit !== 'Adet' && change !== 0) increment = change > 0 ? 0.5 : -0.5;
            const newQty = Math.max(0, item.quantity + increment);

            if (IS_FIREBASE_READY) {
                db.ref(`smartKitchen_pantry/${id}`).update({ quantity: newQty })
                    .then(() => checkLowStock({ ...item, quantity: newQty }, id)).catch(e => console.log(e));
            } else {
                item.quantity = newQty;
                checkLowStock({ ...item }, id);
                saveLocalDB();
            }
        }
    };

    window.deleteItem = (id) => {
        if (IS_FIREBASE_READY) {
            db.ref(`smartKitchen_pantry/${id}`).remove().catch(e => console.log(e));
        } else {
            pantryItems = pantryItems.filter(i => i.id !== id);
            saveLocalDB();
        }
    };

    window.removeShoppingItem = (id) => {
        if (IS_FIREBASE_READY) {
            db.ref(`smartKitchen_shopping/${id}`).remove().catch(e => console.log(e));
        } else {
            shoppingItems = shoppingItems.filter(i => i.id !== id);
            saveLocalDB();
        }
    };

    clearShoppingBtn.addEventListener('click', () => {
        if (IS_FIREBASE_READY) {
            shoppingRef.remove().catch(e => console.log(e));
        } else {
            shoppingItems = [];
            saveLocalDB();
        }
    });

    // --- UI/RENDER Logic ---
    function resetRecipeList() {
        recipeList.innerHTML = `<p class="placeholder-text text-center">Eldeki malzemelere göre tarif bulmak için aşağıdaki butona basın.</p>`;
    }

    suggestBtn.addEventListener('click', () => {
        const availableItems = pantryItems.filter(item => item.quantity > 0).map(item => item.name.toLowerCase().trim());
        const fullMatches = []; const partialMatches = [];
        RECIPES.forEach(recipe => {
            const missing = [];
            recipe.malzemeler.forEach(ing => {
                if (!availableItems.some(i => i.includes(ing) || ing.includes(i))) missing.push(ing);
            });
            if (missing.length === 0) fullMatches.push(recipe);
            else if (missing.length <= 2) partialMatches.push({ ...recipe, missing });
        });

        let html = '';
        if (fullMatches.length === 0 && partialMatches.length === 0) {
            html = `<p class="placeholder-text text-center" style="color:var(--danger-color);">Kilerdeki malzemelerinizle eşleşen tarif bulunamadı. Lütfen daha fazla malzeme ekleyin.</p>`;
        } else {
            if (fullMatches.length > 0) {
                html += `<div class="recipe-section"><h4>✨ Hemen Yapılabilir Yemekler</h4><div class="recipe-cards">${fullMatches.map(r => `
                    <div class="recipe-card">
                        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                            <h5>${r.ad}</h5>
                            <span style="font-size:0.7rem; background:var(--primary-light); color:var(--primary-hover); padding:0.2rem 0.5rem; border-radius:12px; font-weight:600; white-space:nowrap;">${r.kategori}</span>
                        </div>
                        <div class="req-ingredients" style="margin-bottom:0.4rem;"><b>Gerekenler:</b> ${r.malzemeler.join(', ')}</div>
                        <div style="font-size:0.85rem; color:var(--text-main); font-style:italic;">"${r.yapilis}"</div>
                    </div>`).join('')}</div></div>`;
            }
            if (partialMatches.length > 0) {
                html += `<div class="recipe-section missing-section" style="margin-top:1.5rem;"><h4>⚠️ Eksik Malzemeli Yemekler (1-2 Eksik)</h4><div class="recipe-cards">${partialMatches.map(r => `
                    <div class="recipe-card">
                        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                            <h5>${r.ad}</h5>
                            <span style="font-size:0.7rem; background:var(--warning-bg); color:#d97706; padding:0.2rem 0.5rem; border-radius:12px; font-weight:600; white-space:nowrap;">${r.kategori}</span>
                        </div>
                        <div class="req-ingredients" style="margin-bottom:0.4rem;"><b>Gerekenler:</b> ${r.malzemeler.join(', ')}</div>
                        <div style="font-size:0.85rem; color:var(--text-main); font-style:italic;">"${r.yapilis}"</div>
                        <div class="missing-alert">❌ Eksik: ${r.missing.join(', ')}</div>
                    </div>`).join('')}</div></div>`;
            }
        }
        recipeList.innerHTML = html;
    });

    searchRecipeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = recipeSearchInput.value.trim().toLowerCase();
        if (!query) return;

        const matchedRecipes = RECIPES.filter(r => r.ad.toLowerCase().includes(query));

        if (matchedRecipes.length === 0) {
            recipeList.innerHTML = `<p class="placeholder-text text-center" style="color:var(--danger-color);">Sistemde "${query}" kelimesini içeren bir tarif bulunamadı.</p>`;
            recipeSearchInput.value = '';
            return;
        }

        const availableItems = pantryItems.filter(item => item.quantity > 0).map(item => item.name.toLowerCase().trim());
        const targetRecipe = matchedRecipes[0];
        const missing = [];

        targetRecipe.malzemeler.forEach(ing => {
            if (!availableItems.some(i => i.includes(ing) || ing.includes(i))) {
                missing.push(ing);
                const existsInShopping = shoppingItems.find(s => s.name.toLowerCase().includes(ing) || ing.includes(s.name.toLowerCase()));
                if (!existsInShopping) {
                    if (IS_FIREBASE_READY) {
                        shoppingRef.push({ name: ing, unit: "Paket/Adet" }).catch(e => console.log(e));
                    } else {
                        shoppingItems.push({ id: Date.now().toString() + Math.random(), name: ing, unit: "Paket/Adet" });
                        saveLocalDB();
                    }
                }
            }
        });

        let html = '';
        if (missing.length === 0) {
            html = `<div class="recipe-section"><h4>✨ Mutfağa Geçebiliriz!</h4><div class="recipe-cards">
                    <div class="recipe-card" style="border-left: 4px solid var(--primary-color);">
                        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                            <h5>${targetRecipe.ad}</h5>
                            <span style="font-size:0.7rem; background:var(--primary-light); color:var(--primary-hover); padding:0.2rem 0.5rem; border-radius:12px; font-weight:600;">${targetRecipe.kategori}</span>
                        </div>
                        <div class="req-ingredients" style="margin-bottom:0.4rem;"><b>Gerekenler:</b> ${targetRecipe.malzemeler.join(', ')}</div>
                        <div style="font-size:0.85rem; color:var(--text-main); font-style:italic;">"${targetRecipe.yapilis}"</div>
                        <div style="margin-top:0.5rem; color:var(--primary-color); font-weight:600; font-size:0.85rem;">Tüm malzemeler kilerinizde mevcut!</div>
                    </div></div></div>`;
        } else {
            html = `<div class="recipe-section missing-section"><h4>⚠️ Malzemeler Eksik</h4><div class="recipe-cards">
                    <div class="recipe-card" style="border-left: 4px solid #d97706;">
                        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                            <h5>${targetRecipe.ad}</h5>
                        </div>
                        <div class="req-ingredients" style="margin-bottom:0.4rem;"><b>Gerekenler:</b> ${targetRecipe.malzemeler.join(', ')}</div>
                        <div class="missing-alert" style="margin-bottom:0.5rem;">❌ Eksik: ${missing.join(', ')}</div>
                        <div style="padding:0.4rem; background:#fee2e2; color:#b91c1c; border-radius:6px; font-size:0.8rem; font-weight:600;">Eksikler İhtiyaç Listesi'ne eklendi!</div>
                    </div></div></div>`;
        }

        recipeList.innerHTML = html;
        recipeSearchInput.value = '';
    });

    const getFormattedDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' });
    };

    function renderLists() {
        // Expiring
        if (expiringItems.length > 0) {
            expiringList.innerHTML = expiringItems.map(item => {
                const stat = item.diffDays < 0 ? 'Süresi Geçti!' : (item.diffDays === 0 ? 'Bugün!' : `${item.diffDays} gün kaldı`);
                return `<li>
                    <div class="item-info">
                        <span class="item-name">⚠️ ${item.name}</span>
                        <span class="item-qty">${item.quantity} ${item.unit} | <b style="color:#d97706;">SKT: ${stat}</b></span>
                    </div>
                    <div class="item-actions">
                        <button class="btn-delete" onclick="deleteItem('${item.id}')" title="Çöpe At/Sil">🗑️</button>
                    </div>
                </li>`;
            }).join('');
        }

        // Pantry
        if (pantryItems.length === 0) {
            pantryList.innerHTML = `<li style="justify-content: center; color: var(--text-muted); border: none; background: transparent; box-shadow: none;">Kileriniz şu an boş.</li>`;
        } else {
            pantryList.innerHTML = pantryItems.map(item => {
                const isLow = item.quantity < LOW_STOCK_THRESHOLD;
                const expiryText = item.expiryDate ? `<div class="item-expiry-date">SKT: ${getFormattedDate(item.expiryDate)}</div>` : '';
                return `
                    <li class="${isLow ? 'low-stock' : ''}">
                        <div class="item-info">
                            <span class="item-name">${item.name}</span>
                            <span class="item-qty">${item.quantity} ${item.unit} ${isLow ? '(Azaldı!)' : ''}</span>
                            ${expiryText}
                        </div>
                        <div class="item-actions">
                            <button class="btn-decrease" onclick="updateItem('${item.id}', -1)" title="Azalt">-</button>
                            <button class="btn-increase" onclick="updateItem('${item.id}', 1)" title="Arttır">+</button>
                            <button class="btn-delete" onclick="deleteItem('${item.id}')" title="Sil">🗑️</button>
                        </div>
                    </li>
                `;
            }).join('');
        }

        // Shopping
        if (shoppingItems.length === 0) {
            shoppingList.innerHTML = `<li style="justify-content: center; color: var(--text-muted); border: none; background: transparent; box-shadow: none;">İhtiyaç listesi boş.</li>`;
        } else {
            shoppingList.innerHTML = shoppingItems.map(item => {
                return `
                    <li>
                        <div class="item-info">
                            <span class="item-name">${item.name}</span>
                            <span class="item-qty">Alınacak (${item.unit})</span>
                        </div>
                        <div class="item-actions">
                            <button class="btn-delete" onclick="removeShoppingItem('${item.id}')" title="Tamamlandı">✔️</button>
                        </div>
                    </li>
                `;
            }).join('');
        }
    }

    checkAuthStatus();
});
