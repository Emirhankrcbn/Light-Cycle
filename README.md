#  Light Cycle

Tron esintili, 2 kişilik, aynı klavyeden (yüz yüze) oynanan bir ışık motosikleti (light cycle) oyunu. Arkanda parlayan bir iz bırakırsın — kendi izine ya da rakibinin izine çarpan (ya da grid'in dışına çıkan) kaybeder.

**Oyna:** [Canlı link](https://emirhankrcbn.github.io/light-cycles/) *(GitHub Pages aktif edince çalışır)*

## Kontroller

| | Yön |
|---|---|
| Oyuncu 1 (Mavi) | `W A S D` |
| Oyuncu 2 (Pembe) | Ok tuşları |

## Özellikler
- Tur bazlı skor takibi, geri sayımlı başlangıç (3-2-1-GİT!)
- Grid tabanlı hareket, sabit tempoda ilerleyiş
- Kendi/rakip izine çarpma, grid sınırı ve kafa kafaya çarpışma tespiti
- Web Audio API ile ses efektleri (dönüş, çarpışma, kazanma) — ses dosyası gerekmiyor
- Harici bağımlılık yok — sade HTML + CSS + JS (`index.html`, `style.css`, `script.js`)

## Teknolojiler
- Vanilla JavaScript (ES6+)
- HTML5 Canvas (2D çizim, grid tabanlı hareket)
- Web Audio API (prosedürel ses efektleri)
- Derleme/build aracı, framework veya npm paketi yok

## Kurulum ve Çalıştırma

Bu proje saf istemci taraflı (client-side) bir statik sitedir; derleme adımı veya paket kurulumu **gerekmez**.

```bash
git clone https://github.com/Emirhankrcbn/Light-Cycle.git
cd Light-Cycle
```

Ardından iki seçenekten biriyle çalıştır:

1. **Doğrudan aç:** `index.html` dosyasına çift tıkla, tarayıcıda açılsın.
2. **Yerel sunucu ile aç (önerilir):** bazı tarayıcılar `file://` üzerinden açılan sayfalarda küçük kısıtlamalar uygulayabilir; basit bir statik sunucu bunu önler.
   ```bash
   python -m http.server 8000
   # veya: npx serve .
   ```
   Sonra tarayıcıda `http://localhost:8000` adresini aç.

## Ortam Değişkenleri

Yok. Proje hiçbir backend'e, API'ye veya veritabanına bağlanmıyor; tüm mantık tarayıcıda çalışıyor. Bu yüzden `.env` dosyasına, API anahtarına veya başka bir yapılandırmaya ihtiyaç yok.

## Katkıda Bulunma

Bu küçük, kişisel bir proje olsa da öneri/düzeltme her zaman memnuniyetle karşılanır:

1. Repoyu fork'la
2. Değişikliğin için yeni bir branch aç (`git checkout -b ozellik/aciklama`)
3. Değişikliklerini commit'le ve fork'una push'la
4. Bir Pull Request aç ve neyi neden değiştirdiğini kısaca açıkla

Büyük bir değişiklik yapmadan önce bir Issue açıp fikri konuşmak faydalı olur.

## Lisans

Bu repo için henüz bir lisans belirtilmedi (tank-duel reposunda da aynı tercih yapıldı). Belirtilmediği sürece GitHub'ın varsayılan kuralı geçerlidir: kodu görebilir ve inceleyebilirsin, ancak izin verilmeden kopyalama/dağıtma/değiştirme hakkı verilmemiştir (tüm haklar saklıdır). İleride açık kaynak bir lisans (örn. MIT) eklemek istersen bir `LICENSE` dosyası eklemek yeterli.
