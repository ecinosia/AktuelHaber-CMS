import re,markdown,subprocess,os,base64
L="C:/Users/Furkan/Desktop/TFS Software/TFS Yazılım/Designs/Logo/"
b64=lambda f:"data:image/png;base64,"+base64.b64encode(open(L+f,"rb").read()).decode()
logoH=b64("Logo + Yazılım Yatay.png"); logoV=b64("Logo + TFS Yazılım Dikey.png")
s=open("KULLANIM-KILAVUZU.md",encoding="utf-8").read()
s=s[s.index("# Aktüel"):]
s=re.sub(r"^# .*\n","",s,count=1)
i=s.index("## Görsel Listesi"); j=s.index("## 1. Giriş"); s=s[:i]+s[j:]
s=s[:s.index("## 10. Doğrulanması")].rstrip()
s=s.replace("10. Doğrulanması gereken noktalar\n","").replace(" (Bu nokta 10. bölümde doğrulanacaklar listesindedir.)","")
s=re.sub(r"> 💡 \*\*İpucu:\*\* Bu bölümdeki 📷.*\n","",s)
s=s.replace("> **Bu kılavuzu nasıl okumalı?**"+chr(10),"> **Bu kılavuzu nasıl okumalı?**"+chr(10)+">"+chr(10))
s=s.replace("- 📷 işaretli kutular, ekran görüntüsü alınacak yerleri gösterir.","- Kesik çizgili boş kutular, ekran görüntüsü yerleştirilecek alanlardır.")
def fig(m):
    b=m.group(0)
    num=re.search(r"\[GÖRSEL ([\d.]+)\]",b).group(1)
    scr=re.search(r"Ekran: (.*?)\n",b+"\n").group(1)
    cap=re.search(r"Altyazı: (.*)",b).group(1)
    for ext in ("png","jpg","jpeg","webp"):
        f=f"gorseller/{num}.{ext}"
        if os.path.exists(f):
            mime={"jpg":"jpeg"}.get(ext,ext)
            img="data:image/"+mime+";base64,"+base64.b64encode(open(f,"rb").read()).decode()
            return f'<div class="fig"><img class="shot" src="{img}"><div class="cap">Şekil {num}. {cap}</div></div>'
    return f'\n<div class="fig"><div class="figh">GÖRSEL {num} / {scr}</div><div class="box"></div><div class="cap">Şekil {num}. {cap}</div></div>\n'
s=re.sub(r"(?m)^> 📷 .*(?:\n>.*)*",fig,s)
body=markdown.markdown(s,extensions=["tables","sane_lists"])
svg="<svg xmlns='http://www.w3.org/2000/svg' width='110' height='42' viewBox='0 0 2600 1000'><image width='2600' height='1000' opacity='0.35' href='"+logoH+"'/></svg>"
svg64="data:image/svg+xml;base64,"+base64.b64encode(svg.encode()).decode()
css=":root{--hlogo:url("+svg64+")}"+"""
@page{size:A4;margin:24mm 16mm 22mm;@bottom-left{content:"TFS Yazılım · Fikirden Yazılıma";font:8pt 'Space Mono',monospace;color:#6B7280}@bottom-right{content:"tfsyazilim.com · " counter(page);font:8pt 'Space Mono',monospace;color:#6B7280}}
@page{@top-left{content:var(--hlogo);vertical-align:middle;padding-bottom:2mm}@top-center{content:'Yönetim Paneli Kullanım Kılavuzu';font:7.5pt 'Space Mono',monospace;color:#9ca3af;vertical-align:middle;padding-bottom:2mm}@top-right{content:'Aktüel Yayıncılık';font:7.5pt 'Space Mono',monospace;color:#9ca3af;vertical-align:middle;padding-bottom:2mm}}
@page endpg{margin:0;@top-left{content:none}@top-center{content:none}@top-right{content:none}@bottom-left{content:none}@bottom-right{content:none}}
@page :first{margin:0;@top-left{content:none}@top-center{content:none}@top-right{content:none}@bottom-left{content:none}@bottom-right{content:none}}
:root{--p:#6200BE;--ink:#0D0D0F;--swan:#F7F5F2;--n:#6B7280}
body{font-family:Inter,Arial,sans-serif;font-size:10.5pt;line-height:1.6;color:var(--ink);margin:0}
.cover{z-index:10;height:297mm;box-sizing:border-box;padding:22mm 20mm;background:var(--swan);position:relative;page-break-after:always;overflow:hidden}
.cover .logo{width:78mm;mix-blend-mode:multiply}
.cover .eyebrow{font:10pt 'Space Mono',monospace;color:var(--p);letter-spacing:.08em;margin-top:62mm}
.cover h1{font:400 56pt/1.22 Anton,Impact,sans-serif;text-transform:uppercase;margin:6mm 0 8mm;color:var(--ink)}
.cover h1 span{color:var(--p)}
.cover .sub{font-size:14pt;max-width:130mm;color:#333}
.cover .meta{position:absolute;left:20mm;right:20mm;bottom:40mm;border-top:1.5px solid var(--ink);padding-top:5mm;font:9pt 'Space Mono',monospace;display:flex;gap:14mm;color:var(--ink)}
.cover .meta b{display:block;color:var(--n);font-weight:400;font-size:7.5pt;margin-bottom:1mm}
.cover .band{position:absolute;left:0;right:0;bottom:0;height:24mm;background:var(--p);color:#fff;display:flex;align-items:center;justify-content:space-between;padding:0 20mm;font:9pt 'Space Mono',monospace}
.cover .band em{font:400 11pt 'Space Mono',monospace;font-style:normal;letter-spacing:.02em}
h2{font:700 19pt Inter,sans-serif;color:var(--ink);margin:0 0 10px;padding-top:6px;border-top:4px solid var(--p);page-break-before:always}
h2.first{page-break-before:avoid}
h3{font:700 13pt Inter;margin-top:22px}h4{font:600 11pt Inter}
table{border-collapse:collapse;width:100%;margin:10px 0;font-size:9.3pt}th,td{border:1px solid #d5d5d8;padding:5px 8px;vertical-align:top;text-align:left}th{background:var(--swan);font-weight:600}tr{page-break-inside:avoid}
blockquote{margin:10px 0;padding:7px 14px;background:var(--swan);border-left:3px solid var(--p);border-radius:0 8px 8px 0}
code{font-family:'Space Mono',monospace;background:var(--swan);padding:0 3px;border-radius:4px;font-size:9pt}
.fig{page-break-inside:avoid;margin:14px 0}.figh{font:7.5pt 'Space Mono',monospace;color:var(--n);margin-bottom:3px;text-transform:uppercase}
.shot{box-sizing:border-box;display:block;max-width:100%;max-height:15cm;margin:0 auto;border:1px solid #d5d5d8;border-radius:8px}.box{height:7.5cm;border:1.5px dashed #9ca3af;border-radius:8px;background:#fcfbfa}.cap{font-size:9pt;color:#444;text-align:center;margin-top:4px}
.end{page:endpg;page-break-before:always;text-align:center;padding-top:60mm;box-sizing:border-box;position:relative;z-index:10;background:#F7F5F2;height:296.6mm;overflow:hidden}.end img{width:60mm;mix-blend-mode:multiply}.end h2{border:0;font:400 32pt Anton,Impact;text-transform:uppercase;page-break-before:avoid;margin-top:10mm}
.end p{max-width:120mm;margin:4mm auto;color:#333}.end .c{font:10pt 'Space Mono',monospace;color:var(--p);margin-top:10mm;line-height:2}
"""
cover=f'''<section class="cover"><img class="logo" src="{logoH}">
<div class="eyebrow">01 / KULLANIM KILAVUZU</div>
<h1>Aktüel Yayıncılık<br><span>Yönetim Paneli</span></h1>
<div class="sub">Muhabir, editör ve yöneticiler için adım adım içerik yönetimi rehberi.</div>
<div class="meta"><div><b>DOKÜMAN</b>CMS Kullanım Kılavuzu</div><div><b>SÜRÜM</b>1.0</div><div><b>TARİH</b>04.10.2026</div><div><b>HAZIRLAYAN</b>TFS Yazılım</div></div>
<div class="band"><em>Fikirden Yazılıma</em><span>tfsyazilim.com</span></div></section>'''
end=f'''<section class="end"><img src="{logoV}"><h2>Teslim ettik, arkasındayız.</h2>
<p>Aktüel Yayıncılık Yönetim Paneli, TFS Yazılım tarafından sizin ihtiyaçlarınıza göre geliştirilmiştir. Kullanım sırasında karşılaştığınız her soru ve ihtiyaç için bize ulaşabilirsiniz.</p>
<div class="c">tfsyazilim.com<br>info@tfsyazilim.com<br>0507 007 85 95</div></section>'''
body=body.replace("<h2>","<h2 class=\"first\">",1)
html=f"<!doctype html><html lang='tr'><head><meta charset='utf-8'><title>Aktüel Yayıncılık CMS Kullanım Kılavuzu — TFS Yazılım</title><style>{open(os.environ['TEMP']+'/fonts.css').read()}</style><style>{css}</style></head><body>{cover}{body}{end}</body></html>"
open("_k.html","w",encoding="utf-8").write(html)
subprocess.run(["C:/Program Files/Google/Chrome/Application/chrome.exe","--headless","--disable-gpu","--no-pdf-header-footer","--virtual-time-budget=15000","--print-to-pdf="+os.path.abspath("KULLANIM-KILAVUZU-gorselsiz.pdf"),"file:///"+os.path.abspath("_k.html").replace("\\","/")],check=True)
os.remove("_k.html")
