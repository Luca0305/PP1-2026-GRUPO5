# Generador de ilustraciones SVG de platos (vista cenital, estilo plano).
import math, random, os, re, unicodedata, sys
W,H=640,360; CX,CY=320,186
FONDO={"clásico":"#f8e6d4","carnes":"#f4dcd3","pastas":"#fbefcb","minutas":"#fbe3c3","vegetariano":"#e2efd8","vegano":"#d5ece0","liviano":"#ddebf3","sin TACC":"#e9e1f3"}
def slug(n):
    n=unicodedata.normalize("NFD",n); n="".join(c for c in n if unicodedata.category(c)!="Mn")
    return re.sub(r"[^a-z0-9]+","-",n.lower()).strip("-")
R=random.Random()
def f(v): return f"{v:.1f}"
def blob(x,y,rx,ry,col,pts=9,jit=0.12,extra="",rot=0):
    a0=R.random()*6.28; P=[]
    for i in range(pts):
        a=a0+i*2*math.pi/pts; k=1+R.uniform(-jit,jit)
        px,py=rx*k*math.cos(a),ry*k*math.sin(a)
        c,s=math.cos(math.radians(rot)),math.sin(math.radians(rot))
        P.append((x+px*c-py*s,y+px*s+py*c))
    d="M"+" ".join(f"{f((P[i][0]+P[(i+1)%pts][0])/2)},{f((P[i][1]+P[(i+1)%pts][1])/2)}" for i in [pts-1])
    for i in range(pts):
        n=P[(i+1)%pts]; m=((P[i][0]+n[0])/2,(P[i][1]+n[1])/2)
        d+=f" Q{f(P[i][0])},{f(P[i][1])} {f(m[0])},{f(m[1])}"
    return f'<path d="{d}Z" fill="{col}" {extra}/>'
def circ(x,y,r,col,extra=""): return f'<circle cx="{f(x)}" cy="{f(y)}" r="{f(r)}" fill="{col}" {extra}/>'
def ell(x,y,rx,ry,col,rot=0,extra=""): return f'<ellipse cx="{f(x)}" cy="{f(y)}" rx="{f(rx)}" ry="{f(ry)}" fill="{col}" transform="rotate({f(rot)} {f(x)} {f(y)})" {extra}/>'
def dots(x,y,rx,ry,n,col,rmin=1.2,rmax=2.4):
    o=""
    for _ in range(n):
        a=R.random()*6.28; t=math.sqrt(R.random())
        o+=circ(x+rx*t*math.cos(a),y+ry*t*math.sin(a),R.uniform(rmin,rmax),col)
    return o
# ---------- componentes ----------
def pure(x,y,r=42):
    return blob(x,y,r,r*0.82,"#f2dfa6",11,0.1)+blob(x-4,y-4,r*0.7,r*0.55,"#f7e9bf",9,0.12)+ell(x+2,y-2,r*.22,r*.12,"#fbf3d6",20)+ell(x+r*.1,y+r*.05,6,4,"#f5c842")
def milanesa(x,y,w=70,h=48,rot=-12,col="#d8933a"):
    return blob(x,y,w,h,col,10,0.13,rot=rot)+blob(x-3,y-4,w*.85,h*.75,"#e3a64d",10,0.12,rot=rot)+dots(x,y,w*.75,h*.7,26,"#b97326",1,2)+dots(x,y,w*.7,h*.6,12,"#f0c072",1,1.6)
def limon(x,y,r=15,rot=0):
    return f'<g transform="rotate({rot} {x} {y})"><path d="M{x-r},{y} A{r},{r} 0 0 1 {x+r},{y}Z" fill="#f4d03f"/><path d="M{x-r+3},{y} A{r-3},{r-3} 0 0 1 {x+r-3},{y}Z" fill="#fbe98a"/>'+"".join(f'<line x1="{x}" y1="{y}" x2="{f(x+(r-4)*math.cos(math.radians(a)))}" y2="{f(y-(r-4)*math.sin(math.radians(a)))}" stroke="#f4d03f" stroke-width="1.2"/>' for a in (30,60,90,120,150))+'</g>'
def napo(x,y,w=58,h=38,rot=-12):
    return blob(x,y,w,h,"#c9432f",10,0.1,rot=rot)+blob(x+4,y-2,w*.82,h*.7,"#f6cf5a",11,0.18,rot=rot)+blob(x-10,y+4,w*.35,h*.28,"#eaa0a0",7,0.1,rot=rot)+dots(x,y,w*.6,h*.5,10,"#5d8a3a",1,1.6)
def fritas(x,y,n=11,col="#f3c24f"):
    o=""
    for i in range(n):
        a=R.uniform(-60,60); xx=x+R.uniform(-28,28); yy=y+R.uniform(-22,22); L=R.uniform(36,52)
        o+=f'<rect x="{f(xx-L/2)}" y="{f(yy-4)}" width="{f(L)}" height="8" rx="3" fill="{col}" stroke="#d99b2b" stroke-width="1" transform="rotate({f(a)} {f(xx)} {f(yy)})"/>'
    return o
def papas_horno(x,y,n=6):
    o=""
    for i in range(n):
        xx=x+R.uniform(-30,30); yy=y+R.uniform(-24,24)
        o+=blob(xx,yy,R.uniform(12,16),R.uniform(10,13),"#e5a943",7,0.2)+circ(xx-3,yy-3,3,"#f3cd78")+circ(xx+4,yy+3,2.4,"#b9772a")
    return o
def batatas(x,y,n=6):
    o=""
    for i in range(n):
        xx=x+R.uniform(-30,30); yy=y+R.uniform(-24,24)
        o+=blob(xx,yy,R.uniform(12,16),R.uniform(10,13),"#e07a2f",7,0.2)+circ(xx-3,yy-3,3,"#f2a35e")
    return o
def pechuga(x,y,w=62,h=36,rot=-15,col="#e6b47c",grill=True):
    o=blob(x,y,w,h,col,10,0.1,rot=rot)+blob(x-3,y-3,w*.8,h*.7,"#efc795",9,0.1,rot=rot)
    if grill:
        for k in (-24,-8,8,24):
            o+=f'<line x1="{x+k-14}" y1="{y-h*.6}" x2="{x+k+14}" y2="{y+h*.6}" stroke="#9a5a26" stroke-width="4" stroke-linecap="round" opacity=".75"/>'
    return o
def bife(x,y,w=70,h=44,rot=-8):
    o=blob(x,y,w+6,h+5,"#f1e2cf",10,0.08,rot=rot)+blob(x,y,w,h,"#7c3a22",10,0.1,rot=rot)+blob(x-4,y-3,w*.8,h*.7,"#8d4529",9,0.1,rot=rot)
    for k in (-30,-12,6,24):
        o+=f'<line x1="{x+k-16}" y1="{y-h*.55}" x2="{x+k+16}" y2="{y+h*.55}" stroke="#3f1b10" stroke-width="5" stroke-linecap="round" opacity=".8"/>'
    return o
def carne_feta(x,y,n=4):
    o=""
    for i in range(n):
        xx=x+(i-(n-1)/2)*22; yy=y+R.uniform(-4,4)
        o+=ell(xx,yy,22,30,"#7a3a24",-12)+ell(xx,yy,16,23,"#c9767a",-12)+ell(xx-2,yy-3,8,11,"#dd9a98",-12)
    return o
def bondiola(x,y,n=4):
    o=""
    for i in range(n):
        xx=x+(i-(n-1)/2)*24; o+=ell(xx,y,23,30,"#5e2c18",-10)+ell(xx,y,18,24,"#8b4a2c",-10)+dots(xx,y,12,16,6,"#c27a4c",1,2)
    return o
def pescado(x,y,w=70,h=34,rot=-10,col="#f2e2c6"):
    return blob(x,y,w,h,col,10,0.08,rot=rot)+blob(x-3,y-3,w*.8,h*.6,"#f8eedb",9,0.08,rot=rot)+"".join(f'<path d="M{x+k},{y-h*.5} q6,{h*.5} 0,{h}" stroke="#e3cfa8" stroke-width="2" fill="none"/>' for k in (-30,-12,6,24))
def rebozado(x,y,w=70,h=34,rot=-10):
    return blob(x,y,w,h,"#e9b85c",10,0.15,rot=rot)+blob(x-3,y-4,w*.8,h*.62,"#f2cf82",9,0.15,rot=rot)+dots(x,y,w*.7,h*.5,14,"#d39a3c",1,2)
def arroz(x,y,r=44,extra=""):
    o=blob(x,y,r,r*.82,"#f6f2e6",11,0.1)+blob(x-3,y-4,r*.75,r*.6,"#fcfaf2",9,0.1)
    for _ in range(40):
        a=R.random()*6.28; t=math.sqrt(R.random())*.85
        o+=ell(x+r*t*math.cos(a),y+r*.8*t*math.sin(a),3.2,1.4,"#e6dfcc",R.uniform(0,180))
    return o
def fideos(x,y,r=60,col="#f1cf73",dark="#d9ae4a"):
    o=blob(x,y,r,r*.85,col,12,0.08)
    for i in range(16):
        a=R.uniform(0,6.28); rr=R.uniform(.2,.8)*r
        x1,y1=x+rr*math.cos(a),y+rr*.85*math.sin(a)
        o+=f'<path d="M{f(x1)},{f(y1)} q{f(R.uniform(-30,30))},{f(R.uniform(-30,30))} {f(R.uniform(-40,40))},{f(R.uniform(-30,30))} t{f(R.uniform(-30,30))},{f(R.uniform(-20,20))}" stroke="{dark}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/>'
    return o
def salsa(x,y,r,col="#c8402e",hi="#de5a40"):
    return blob(x,y,r,r*.8,col,10,0.18)+blob(x-3,y-3,r*.55,r*.4,hi,8,0.2)
def albahaca(x,y,n=3):
    o=""
    for i in range(n):
        xx=x+R.uniform(-14,14); yy=y+R.uniform(-10,10); a=R.uniform(0,180)
        o+=ell(xx,yy,10,6,"#3f8f3a",a)+f'<line x1="{f(xx-8*math.cos(math.radians(a)))}" y1="{f(yy-8*math.sin(math.radians(a)))}" x2="{f(xx+8*math.cos(math.radians(a)))}" y2="{f(yy+8*math.sin(math.radians(a)))}" stroke="#2f6e2b" stroke-width="1"/>'
    return o
def queso_rallado(x,y,rx,ry,n=30): return dots(x,y,rx,ry,n,"#fbf3cf",1,1.8)
def noquis(x,y,r=50,n=22):
    o=""
    for _ in range(n):
        a=R.random()*6.28; t=math.sqrt(R.random())*.85
        xx,yy=x+r*t*math.cos(a),y+r*.8*t*math.sin(a); rot=R.uniform(0,180)
        o+=ell(xx,yy,10,7,"#f0d9a0",rot,'stroke="#d6b973" stroke-width="1"')+ell(xx,yy,4,1.2,"#d6b973",rot)
    return o
def ravioles(x,y,n=7,col="#f1d89a"):
    o=""
    for i in range(n):
        a=i*2*math.pi/n+R.uniform(-.2,.2); xx=x+34*math.cos(a)*(0 if i==0 else 1); yy=y+28*math.sin(a)*(0 if i==0 else 1)
        rot=R.uniform(-20,20)
        o+=f'<rect x="{f(xx-14)}" y="{f(yy-14)}" width="28" height="28" rx="4" fill="{col}" stroke="#d2b06b" stroke-width="2" stroke-dasharray="3 2" transform="rotate({f(rot)} {f(xx)} {f(yy)})"/>'+circ(xx,yy,6,"#f7e6b8")
    return o
def sorrentinos(x,y,n=6):
    o=""
    for i in range(n):
        a=i*2*math.pi/n; xx=x+(0 if i==0 else 32*math.cos(a)); yy=y+(0 if i==0 else 26*math.sin(a))
        o+=circ(xx,yy,17,"#f1d89a",'stroke="#d2b06b" stroke-width="2"')+circ(xx,yy,9,"#f7e6b8")
    return o
def canelones(x,y,n=3,salsa_col="#c8402e"):
    o=""
    for i in range(n):
        yy=y+(i-(n-1)/2)*26
        o+=f'<rect x="{x-58}" y="{f(yy-12)}" width="116" height="24" rx="12" fill="#f1d89a" stroke="#d2b06b" stroke-width="1.5"/>'
    o+=blob(x,y,62,30,"#fbf4e1",10,0.15,'opacity=".92"')+salsa(x+8,y,26,salsa_col)+queso_rallado(x,y,40,22,16)
    return o
def lasana(x,y):
    o=f'<rect x="{x-58}" y="{y-42}" width="116" height="84" rx="8" fill="#e3b45c"/>'
    for k in range(4):
        yy=y-30+k*20; o+=f'<path d="M{x-58},{yy} q29,-6 58,0 t58,0" stroke="#b5432c" stroke-width="7" fill="none"/>'
    o+=f'<rect x="{x-58}" y="{y-42}" width="116" height="20" rx="8" fill="#f2cd6b"/>'+dots(x,y-32,50,8,18,"#c98a33",1.5,3)+dots(x,y-32,50,8,6,"#b5432c",2,3)
    return o
def hojas(x,y,r=40,n=10,cols=("#6db04f","#8cc66a","#4f9a3a")):
    o=""
    for _ in range(n):
        a=R.random()*6.28; t=math.sqrt(R.random())*.75
        xx,yy=x+r*t*math.cos(a),y+r*.8*t*math.sin(a)
        o+=blob(xx,yy,R.uniform(13,20),R.uniform(8,12),R.choice(cols),7,0.25,rot=R.uniform(0,180))
    return o
def tomate(x,y,r=11):
    return circ(x,y,r,"#d9412f")+circ(x,y,r-3,"#ec6b52")+"".join(circ(x+(r-6)*math.cos(a),y+(r-6)*math.sin(a),1.6,"#f6d35b") for a in (0.5,2.1,3.7,5.3))
def palta(x,y,rot=0):
    return ell(x,y,20,11,"#4c7a2a",rot)+ell(x,y,17,8.5,"#b9d77c",rot)+ell(x,y,13,6,"#d7e9a1",rot)
def zanahoria(x,y,n=6):
    return "".join(f'<rect x="{f(x+R.uniform(-20,20))}" y="{f(y+R.uniform(-16,16))}" width="22" height="5" rx="2" fill="#ee8a2f" transform="rotate({f(R.uniform(0,180))} {f(x)} {f(y)})"/>' for _ in range(n))
def arvejas(x,y,rx,ry,n=10): return dots(x,y,rx,ry,n,"#6fae3e",2.6,3.4)
def choclo(x,y,rx,ry,n=10): return dots(x,y,rx,ry,n,"#f5c62f",2.4,3.2)
def morron(x,y,n=5,col="#d83c2b"):
    return "".join(f'<path d="M{f(x+R.uniform(-30,30))},{f(y+R.uniform(-20,20))} q10,-8 22,0" stroke="{col}" stroke-width="5" fill="none" stroke-linecap="round"/>' for _ in range(n))
def brocoli(x,y):
    return f'<rect x="{x-2}" y="{y}" width="4" height="10" fill="#7aa64a"/>'+circ(x-5,y,6,"#3f7f2f")+circ(x+5,y,6,"#3f7f2f")+circ(x,y-5,6,"#4d9238")
def zucchini(x,y,n=4):
    o=""
    for i in range(n):
        xx=x+R.uniform(-26,26); yy=y+R.uniform(-18,18)
        o+=circ(xx,yy,11,"#3f7a2c")+circ(xx,yy,9,"#cfe08f")+f'<line x1="{xx-7}" y1="{yy}" x2="{xx+7}" y2="{yy}" stroke="#7a5a2a" stroke-width="2" opacity=".6"/>'
    return o
def tarta(x,y,r=58,relleno="#7fae4c",manchas="#5f8f35",hi="#9cc46a"):
    a1,a2=math.radians(-60),math.radians(0)
    p1=(x+r*math.cos(a1),y+r*math.sin(a1)); p2=(x+r*math.cos(a2),y+r*math.sin(a2))
    o=f'<path d="M{x-30},{y+10} L{f(p1[0]-30)},{f(p1[1]+10)} A{r},{r} 0 0 1 {f(p2[0]-30)},{f(p2[1]+10)} Z" fill="#d59a48"/>'
    o+=f'<path d="M{x-30},{y+10} L{f(p1[0]-30)},{f(p1[1]+10)} A{r},{r} 0 0 1 {f(p2[0]-30)},{f(p2[1]+10)} Z" fill="{relleno}" transform="translate(3 3) scale(.96)" transform-origin="{x-30} {y+10}"/>'
    o+=f'<path d="M{f(p1[0]-30)},{f(p1[1]+10)} A{r},{r} 0 0 1 {f(p2[0]-30)},{f(p2[1]+10)}" stroke="#c4843a" stroke-width="9" fill="none" stroke-linecap="round"/>'
    o+=dots(x+2,y-10,18,14,10,manchas,1.5,3)+dots(x+2,y-10,18,14,8,hi,1.2,2.4)
    return o
def empanadas(x,y,n=3,col="#e2a64e",dark="#c4843a"):
    o=""
    for i in range(n):
        xx=x+(i-(n-1)/2)*48; yy=y+(10 if i%2 else -6); rot=R.uniform(-15,15)
        o+=f'<g transform="rotate({f(rot)} {f(xx)} {f(yy)})"><path d="M{xx-34},{yy+10} A34,30 0 0 1 {xx+34},{yy+10} Z" fill="{col}"/>'
        o+=f'<path d="M{xx-30},{yy+2} A30,25 0 0 1 {xx+30},{yy+2}" stroke="{dark}" stroke-width="5" fill="none" stroke-dasharray="4 4" stroke-linecap="round"/>'
        o+=ell(xx-6,yy-6,10,4,"#f1c983",-10)+"</g>"
    return o
def hamburguesa(x,y):
    return circ(x,y,46,"#c98a3c")+circ(x-4,y-4,41,"#dda152")+ell(x-14,y-14,16,9,"#eab96b",-25)+dots(x,y,30,30,22,"#fbf0d4",1.2,2.2)
def wrap(x,y):
    o=""
    for i,(dx,rot) in enumerate(((-26,-20),(28,15))):
        xx=x+dx
        o+=f'<g transform="rotate({rot} {xx} {y})">'+ell(xx,y,26,34,"#f0dcb0")+ell(xx,y,21,29,"#e7cf9b")+ell(xx,y,17,24,"#f5ead0")
        o+=blob(xx-4,y-6,9,7,"#e6b47c",6,0.2)+blob(xx+6,y+4,8,6,"#6db04f",6,0.3)+circ(xx+2,y-12,4,"#d9412f")+blob(xx-6,y+12,7,5,"#f6cf5a",6,0.2)+"</g>"
    return o
def tortilla(x,y,r=60):
    o=circ(x,y,r,"#d99b3a")+circ(x,y,r-5,"#f0c14f")+dots(x,y,r*.8,r*.8,16,"#d99b3a",2,5)+dots(x,y,r*.8,r*.8,10,"#f7d983",2,4)
    o+=f'<path d="M{x},{y} L{x+r+2},{y-10} A{r},{r} 0 0 1 {x+r-6},{y+30} Z" fill="#fbfaf6"/>'
    return o
def berenjenas(x,y,n=4):
    o=""
    for i in range(n):
        xx=x+(i%2-0.5)*58; yy=y+(i//2-0.5)*46
        o+=ell(xx,yy,30,22,"#4a2a5a")+ell(xx,yy,26,18,"#e9dcb0")+salsa(xx,yy,16,"#c8402e")+blob(xx+2,yy-2,12,9,"#f6cf5a",7,0.2)
    return o+dots(x,y,60,40,10,"#3f8f3a",1,1.6)
def albondigas(x,y):
    o=salsa(x,y,62,"#b83a28","#cc4a33")
    for i in range(6):
        a=i*1.05+0.3; xx=x+(0 if i==5 else 30*math.cos(a)); yy=y+(0 if i==5 else 24*math.sin(a))
        o+=circ(xx,yy,15,"#7a3e24")+circ(xx-4,yy-4,6,"#9a5534")
    return o+albahaca(x+10,y-30,2)
def pastel_papa(x,y):
    o=f'<rect x="{x-56}" y="{y-38}" width="112" height="76" rx="10" fill="#8a4a2a"/>'
    o+=f'<rect x="{x-56}" y="{y-38}" width="112" height="52" rx="10" fill="#f0d488"/>'+dots(x,y-14,48,20,26,"#d8a24a",2,5)+dots(x,y-14,48,20,10,"#b97a30",1.5,3)
    return o+dots(x,y+26,48,8,10,"#5e2c18",1.5,3)
def matambre(x,y):
    return blob(x,y,64,46,"#a4593a",10,0.12)+salsa(x,y,52,"#c8402e")+blob(x+2,y-2,44,30,"#f6cf5a",12,0.22)+dots(x,y,40,28,22,"#4a7a2c",1,1.8)+dots(x,y,36,24,5,"#2e2e2e",2,2.6)
def plato_hondo(x,y,r,rim="#ffffff",caldo="#c2803c"):
    return circ(x,y+6,r+2,"rgba(0,0,0,.12)")+circ(x,y,r,rim,'stroke="#e6e0d6" stroke-width="2"')+circ(x,y,r-14,caldo)
def lentejas(x,y,r,chorizo=True,zapallo=False):
    o=dots(x,y,r,r,140,"#7a4a26",2.2,3.6)+dots(x,y,r,r,50,"#9a6236",2,3)
    if chorizo:
        for _ in range(5): xx=x+R.uniform(-r*.6,r*.6); yy=y+R.uniform(-r*.6,r*.6); o+=circ(xx,yy,9,"#a3271c")+dots(xx,yy,6,6,4,"#f0c2a6",1,1.6)
    if zapallo:
        for _ in range(6): xx=x+R.uniform(-r*.6,r*.6); yy=y+R.uniform(-r*.6,r*.6); o+=f'<rect x="{f(xx-7)}" y="{f(yy-7)}" width="14" height="14" rx="3" fill="#ee9a32"/>'
    return o+zanahoria(x,y,4)
def locro(x,y,r):
    o=choclo(x,y,r,r,60)+dots(x,y,r,r,22,"#f6e7c4",3,4.5)
    for _ in range(6): xx=x+R.uniform(-r*.6,r*.6); yy=y+R.uniform(-r*.6,r*.6); o+=f'<rect x="{f(xx-8)}" y="{f(yy-8)}" width="16" height="16" rx="3" fill="#ee9a32"/>'
    for _ in range(4): xx=x+R.uniform(-r*.6,r*.6); yy=y+R.uniform(-r*.6,r*.6); o+=circ(xx,yy,8,"#a3271c")
    return o+dots(x,y-r*.3,r*.5,8,8,"#c8402e",1.5,2.5)+arvejas(x,y,10,10,0)
def estofado(x,y,r):
    o=""
    for _ in range(7): xx=x+R.uniform(-r*.65,r*.65); yy=y+R.uniform(-r*.65,r*.65); o+=blob(xx,yy,12,10,"#6a2f1a",7,0.25)
    for _ in range(6): xx=x+R.uniform(-r*.65,r*.65); yy=y+R.uniform(-r*.65,r*.65); o+=f'<rect x="{f(xx-8)}" y="{f(yy-8)}" width="16" height="16" rx="4" fill="#ecc66a"/>'
    for _ in range(6): xx=x+R.uniform(-r*.65,r*.65); yy=y+R.uniform(-r*.65,r*.65); o+=circ(xx,yy,6,"#ee8a2f")
    return o+arvejas(x,y,r*.6,r*.6,6)
def curry(x,y,r):
    return dots(x,y,r*.85,r*.85,26,"#f1d39a",5,6.5)+dots(x,y,r*.8,r*.8,10,"#3f8f3a",1.5,2.5)+f'<path d="M{x-r*.6},{y} q{r*.3},-{r*.2} {r*.6},0 t{r*.6},0" stroke="#fbf1dd" stroke-width="3" fill="none" opacity=".8"/>'
def risotto(x,y,r):
    o=""
    for _ in range(70):
        a=R.random()*6.28; t=math.sqrt(R.random())*.9; o+=ell(x+r*t*math.cos(a),y+r*t*math.sin(a),3.4,1.6,"#f7efd2",R.uniform(0,180))
    for _ in range(7):
        xx=x+R.uniform(-r*.6,r*.6); yy=y+R.uniform(-r*.6,r*.6)
        o+=f'<path d="M{f(xx-9)},{f(yy)} a9,8 0 0 1 18,0 h-6 v6 h-6 v-6 Z" fill="#a98563"/>'
    return o+dots(x,y,r*.7,r*.7,10,"#3f8f3a",1,1.6)
def quinoa(x,y,r):
    o=dots(x-r*.3,y-r*.3,r*.45,r*.4,90,"#e4cf9e",1.4,2.2)
    o+="".join(palta(x+r*.35+k*6,y-r*.25+k*10,30) for k in range(3))
    o+=zanahoria(x+r*.3,y+r*.35,8)+tomate(x-r*.35,y+r*.35,10)+tomate(x-r*.15,y+r*.5,9)+dots(x,y,r*.2,r*.2,10,"#2e2e2e",1,1.5)
    return o
def wok(x,y,r):
    return morron(x,y,6,"#d83c2b")+morron(x,y,5,"#3f8f3a")+morron(x,y,4,"#f2c230")+zanahoria(x,y,8)+brocoli(x-20,y+10)+brocoli(x+24,y-12)+dots(x,y,r*.6,r*.6,16,"#f3ead0",2,3)
def croutons(x,y,n=7): return "".join(f'<rect x="{f(x+R.uniform(-30,30))}" y="{f(y+R.uniform(-22,22))}" width="10" height="10" rx="2" fill="#e0a64c" transform="rotate({f(R.uniform(0,90))} {f(x)} {f(y)})"/>' for _ in range(n))
def tiras_pollo(x,y,n=5): return "".join(ell(x+R.uniform(-28,28),y+R.uniform(-22,22),14,6,"#e6b47c",R.uniform(0,180),'stroke="#b8763a" stroke-width="1.5"') for _ in range(n))
def caprese(x,y):
    o=""
    for i in range(7):
        a=i*2*math.pi/7; xx=x+46*math.cos(a); yy=y+38*math.sin(a)
        o+=tomate(xx,yy,17) if i%2 else circ(xx,yy,17,"#fbf8ee",'stroke="#ece6d4" stroke-width="2"')
    return o+albahaca(x,y,4)+f'<path d="M{x-40},{y+6} q20,-10 40,0 t40,0" stroke="#c9b13a" stroke-width="2" fill="none" opacity=".7"/>'
# ---------- escena ----------
def escena(cat, cuerpo, hondo=False):
    bg=FONDO.get(cat,"#eee")
    o=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">'
    o+=f'<rect width="{W}" height="{H}" fill="{bg}"/>'
    o+="".join(circ(R.uniform(0,W),R.uniform(0,H),R.uniform(2,5),"#ffffff",'opacity=".35"') for _ in range(40))
    # mantel / servilleta
    o+=f'<rect x="{CX-230}" y="{CY-150}" width="460" height="300" rx="18" fill="#ffffff" opacity=".35"/>'
    # cubiertos
    o+=f'<g fill="#c7c2bb"><rect x="{CX-196}" y="{CY-70}" width="7" height="150" rx="3"/><rect x="{CX-204}" y="{CY-102}" width="23" height="40" rx="9"/>'
    o+=f'<rect x="{CX+186}" y="{CY-102}" width="9" height="182" rx="4"/><path d="M{CX+186},{CY-102} q22,10 9,80 h-9Z"/></g>'
    if not hondo:
        o+=circ(CX+4,CY+8,150,"rgba(0,0,0,.10)")+circ(CX,CY,150,"#ffffff",'stroke="#e9e4dc" stroke-width="2"')+circ(CX,CY,122,"#fbfaf7",'stroke="#efebe4" stroke-width="2"')
    else:
        o+=circ(CX+4,CY+8,150,"rgba(0,0,0,.10)")+circ(CX,CY,150,"#ffffff",'stroke="#e9e4dc" stroke-width="2"')
    if not hondo:
        cuerpo=f'<g transform="translate({CX} {CY}) scale(1.36) translate({-CX} {-CY})">'+cuerpo+'</g>'
    return o+cuerpo+"</svg>"
def hondo(caldo, contenido_fn):
    return circ(CX,CY,128,"#f7f4ef",'stroke="#e6e0d6" stroke-width="2"')+circ(CX,CY,112,caldo)+contenido_fn(CX,CY,100)
X1,X2=CX-36,CX+40
PLATOS={
 "Milanesa con puré":("clásico",lambda:milanesa(X1+5,CY-5)+pure(X2+10,CY+20,44)+limon(X2+20,CY-62,16,15)),
 "Tarta de verdura":("vegetariano",lambda:tarta(CX-12,CY+30,92)+hojas(X2+36,CY+52,22,5)),
 "Ensalada César":("liviano",lambda:hojas(CX,CY,92,26)+tiras_pollo(CX+10,CY,6)+croutons(CX,CY,8)+dots(CX,CY,70,60,22,"#fbf3cf",2,3.4)),
 "Pollo al horno con papas":("clásico",lambda:pechuga(X1,CY-8,58,40,-20,"#c9813e",False)+ell(X1-50,CY-30,18,8,"#f3ead8",-30)+papas_horno(X2+10,CY+20,7)+albahaca(X1+10,CY-40,2)),
 "Ñoquis con salsa fileto":("pastas",lambda:salsa(CX,CY,86,"#c13b29","#d6503a")+noquis(CX,CY,72,24)+salsa(CX+10,CY-6,28)+albahaca(CX-20,CY-30,3)+queso_rallado(CX,CY,50,40,20)),
 "Wok de vegetales":("vegetariano",lambda:arroz(X1,CY+20,42)+wok(X2+4,CY-8,80)+wok(X2-10,CY+14,60)),
 "Pastel de papa":("clásico",lambda:pastel_papa(CX-10,CY)+hojas(X2+50,CY+60,22,5)),
 "Guiso de lentejas":("clásico",lambda:hondo("#8a5228",lambda x,y,r:lentejas(x,y,r))),
 "Pollo al verdeo con puré":("clásico",lambda:pechuga(X1,CY-10,58,38,-15,"#e6b47c",False)+blob(X1,CY-10,50,28,"#f4ecd2",9,0.2,'opacity=".85"')+dots(X1,CY-10,40,22,24,"#5aa43a",1.5,2.6)+pure(X2+10,CY+24,42)),
 "Albóndigas con arroz":("clásico",lambda:albondigas(X1,CY)+arroz(X2+20,CY+20,40)),
 "Locro criollo":("clásico",lambda:hondo("#e9a83c",lambda x,y,r:locro(x,y,r))),
 "Estofado de carne con papas":("clásico",lambda:hondo("#9a4a26",lambda x,y,r:estofado(x,y,r))),
 "Bife de chorizo con ensalada":("carnes",lambda:bife(X1,CY-4)+hojas(X2+16,CY+10,40,10)+tomate(X2+10,CY+30)+tomate(X2+34,CY-4)),
 "Carne al horno con papas":("carnes",lambda:carne_feta(X1,CY-8,3)+papas_horno(X2+14,CY+18,7)),
 "Bondiola braseada con batatas":("carnes",lambda:bondiola(X1,CY,3)+batatas(X2+16,CY+18,7)+dots(X1,CY+40,40,8,8,"#3f8f3a",1,1.8)),
 "Matambre a la pizza":("carnes",lambda:matambre(CX-14,CY)+hojas(X2+56,CY+56,20,4)),
 "Ravioles de ricota con salsa mixta":("pastas",lambda:salsa(CX,CY,88,"#e07a5a","#ec9474")+ravioles(CX,CY,7)+queso_rallado(CX,CY,60,50,26)+albahaca(CX+30,CY-40,2)),
 "Tallarines con bolognesa":("pastas",lambda:fideos(CX,CY,88)+salsa(CX+6,CY-4,44,"#9e3a22","#b5472b")+dots(CX+6,CY-4,32,24,16,"#6a2a16",2,3.5)+queso_rallado(CX,CY,36,28,18)+albahaca(CX+20,CY-30,2)),
 "Lasaña de carne":("pastas",lambda:lasana(CX-10,CY)+albahaca(CX+64,CY-40,2)),
 "Sorrentinos de jamón y queso":("pastas",lambda:salsa(CX,CY,88,"#c13b29","#d6503a")+sorrentinos(CX,CY,6)+queso_rallado(CX,CY,60,50,20)+albahaca(CX-34,CY-40,2)),
 "Fideos al pesto":("pastas",lambda:fideos(CX,CY,88)+blob(CX,CY,46,36,"#5f9a35",10,0.25,'opacity=".9"')+dots(CX,CY,40,30,14,"#3f7a24",1.5,3)+dots(CX,CY,40,30,8,"#c9a066",2,3)+albahaca(CX+30,CY-34,3)),
 "Canelones de verdura":("pastas",lambda:canelones(CX,CY,3)+albahaca(CX+50,CY-40,2)),
 "Milanesa napolitana con papas fritas":("minutas",lambda:milanesa(X1,CY-4,66,48)+napo(X1,CY-6,52,34)+fritas(X2+18,CY+10,12)),
 "Hamburguesa casera con papas":("minutas",lambda:hamburguesa(X1,CY-4)+fritas(X2+18,CY+10,12)+tomate(X1+40,CY+50,10)),
 "Empanadas de carne (3)":("minutas",lambda:empanadas(CX,CY,3)+limon(CX+70,CY+60,14,10)),
 "Tarta de jamón y queso":("minutas",lambda:tarta(CX-12,CY+30,92,"#f3d97a","#e7a3a0","#fbe9a6")+hojas(X2+36,CY+52,22,5)),
 "Suprema napolitana con puré":("minutas",lambda:pechuga(X1,CY-4,62,40,-12,"#d8933a",False)+dots(X1,CY-4,50,30,20,"#b97326",1,2)+napo(X1,CY-6,48,30)+pure(X2+14,CY+20,40)),
 "Merluza a la romana con ensalada":("minutas",lambda:rebozado(X1,CY-4,68,34)+limon(X1+40,CY+40,15,20)+hojas(X2+16,CY+8,40,10)+tomate(X2+20,CY+30)),
 "Tortilla de papas":("vegetariano",lambda:tortilla(CX-10,CY,82)+hojas(X2+60,CY+64,18,4)),
 "Berenjenas a la napolitana":("vegetariano",lambda:berenjenas(CX,CY,4)),
 "Milanesa de soja con ensalada":("vegetariano",lambda:milanesa(X1,CY-4,64,44,-10,"#c89a4a")+hojas(X2+16,CY+10,40,10)+tomate(X2+30,CY+30)+palta(X2,CY-30,20)),
 "Risotto de hongos":("vegetariano",lambda:hondo("#efe2bd",lambda x,y,r:risotto(x,y,r))),
 "Empanadas de humita (3)":("vegetariano",lambda:empanadas(CX,CY,3,"#efc061","#d4a03c")+choclo(CX,CY+66,26,8,8)),
 "Curry de garbanzos con arroz":("vegano",lambda:hondo("#e39a2a",lambda x,y,r:curry(x,y,r))),
 "Hamburguesa de lentejas con ensalada":("vegano",lambda:circ(X1,CY-4,44,"#6f5a32")+circ(X1-3,CY-7,38,"#8a7340")+dots(X1,CY-4,30,30,30,"#a3713e",1.5,2.8)+dots(X1,CY-4,30,30,12,"#6aa04a",1.2,2.2)+hojas(X2+16,CY+10,40,10)+tomate(X2+30,CY+30)),
 "Bowl de quinoa y vegetales":("vegano",lambda:hondo("#f1e6cc",lambda x,y,r:quinoa(x,y,r))),
 "Guiso de lentejas vegano":("vegano",lambda:hondo("#8a5228",lambda x,y,r:lentejas(x,y,r,False,True))),
 "Ensalada de pollo y palta":("liviano",lambda:hojas(CX,CY,92,24)+tiras_pollo(CX-20,CY-10,6)+palta(CX+30,CY+20,20)+palta(CX+44,CY-10,-10)+tomate(CX-40,CY+30)+tomate(CX-10,CY+50,9)),
 "Pescado al horno con verduras":("liviano",lambda:pescado(X1,CY-4)+limon(X1+20,CY-40,14,-10)+zucchini(X2+16,CY+10,4)+morron(X2+16,CY+10,3)+dots(X1,CY-4,40,14,10,"#3f8f3a",1,1.6)),
 "Wrap de pollo y vegetales":("liviano",lambda:wrap(CX-20,CY)+hojas(X2+56,CY+50,20,5)),
 "Ensalada caprese":("liviano",lambda:caprese(CX,CY)),
 "Pollo grillado con vegetales (sin TACC)":("sin TACC",lambda:pechuga(X1,CY-6)+zucchini(X2+14,CY+10,4)+morron(X2+14,CY+10,4)),
 "Arroz primavera (sin TACC)":("sin TACC",lambda:arroz(CX,CY,92)+arvejas(CX,CY,70,60,22)+zanahoria(CX,CY,10)+choclo(CX,CY,70,60,22)),
 "Bife con puré (sin TACC)":("sin TACC",lambda:bife(X1,CY-4)+pure(X2+14,CY+20,42)),
}
if __name__=="__main__":
    out=sys.argv[1]; os.makedirs(out,exist_ok=True)
    for n,(cat,fn) in PLATOS.items():
        R.seed(slug(n)); h=n in ("Guiso de lentejas","Locro criollo","Estofado de carne con papas","Risotto de hongos","Curry de garbanzos con arroz","Bowl de quinoa y vegetales","Guiso de lentejas vegano")
        open(os.path.join(out,slug(n)+".svg"),"w").write(escena(cat,fn(),h))
    print(len(PLATOS))
