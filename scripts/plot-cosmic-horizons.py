# Plot the three cosmic horizons over time and on the triangle (docs/img/cosmic-horizons.png).
# ΛCDM with Planck 2018 values. Needs numpy, scipy, matplotlib.
import numpy as np, matplotlib
matplotlib.use("Agg"); import matplotlib.pyplot as plt
from scipy.integrate import cumulative_trapezoid as ct
H0=67.7; Om=0.31; Or=9e-5; OL=1-Om-Or
c=299792.458; Mpc_Gly=3.2616e-3; kmsMpc_perGyr=1/977.8  # H in 1/Gyr
H0g=H0*kmsMpc_perGyr; cG=c*Mpc_Gly/H0*H0g  # c in Gly/Gyr = 1.0 (approx)
cG=1.0/1.0  # 1 ly per yr
a=np.logspace(-8,1.6,200000)
E=np.sqrt(Or/a**4+Om/a**3+OL); H=H0g*E          # 1/Gyr
t=ct(1/(a*H),a,initial=0)+ (1/(2*H0g*np.sqrt(Or)))*a[0]**2  # Gyr
t0=np.interp(1,a,t)
chi=ct(1/(a*a*H),a,initial=0)   # comoving distance light travels, in Gly (c=1 Gly/Gyr)
chi_inf=chi[-1]+1/(a[-1]*H0g*np.sqrt(OL))       # tail to a=inf
chi0=np.interp(1,a,chi)
RH=1/H; PH=a*chi; EH=a*(chi_inf-chi); LC=np.where(t<=t0,a*(chi0-chi),np.nan)
now=lambda y: np.interp(t0,t,y)
print("t0",t0,"Hubble",now(RH),"event",now(EH),"particle",now(PH))
fig,ax=plt.subplots(1,2,figsize=(13,6.2),gridspec_kw=dict(width_ratios=[1.25,1]))
bg="#0b0c24"; fg="#e8eaf6"
for x in ax: x.set_facecolor(bg)
fig.patch.set_facecolor(bg)
A=ax[0]; m=t<=32
A.plot(t[m],RH[m],color="#ffd54f",lw=2.4,label="Hubble sphere: recedes at the speed of light now")
A.plot(t[m],EH[m],color="#ff6e6e",lw=2.4,label="Cosmic event horizon: events beyond it never reach us")
A.plot(t[m],PH[m],color="#4dd0e1",lw=2.4,label="Particle horizon: the observable universe")
A.plot(t[m],LC[m],color="#b0b4c8",lw=1.6,ls="--",label="Our past light cone: where the light we see today left from")
A.axvline(t0,color=fg,lw=0.8,alpha=0.5); A.text(t0+0.3,1.5,"now",color=fg,fontsize=10)
for y,col,lab,dy in [(now(RH),"#ffd54f","14.4",-3.4),(now(EH),"#ff6e6e",f"{now(EH):.1f}",1.2),(now(PH),"#4dd0e1",f"{now(PH):.1f}",1.2)]:
  A.plot([t0],[y],"o",color=col,ms=6); A.text(t0-0.5,y+dy,lab,color=col,ha="right",fontsize=10)
A.axhline(1/(H0g*np.sqrt(OL)),color="#ff6e6e",lw=0.8,ls=":",alpha=0.7)
A.text(31.5,1/(H0g*np.sqrt(OL))-2.5,f"both end at {1/(H0g*np.sqrt(OL)):.1f}",color="#ff9e9e",ha="right",fontsize=9)
A.set_xlim(0,32); A.set_ylim(0,80); A.set_xlabel("time since the Big Bang (billion years)",color=fg)
A.set_ylabel("distance from us (billion light-years)",color=fg)
A.set_title("The three horizons over time (ΛCDM, Planck 2018)",color=fg,fontsize=12)
A.legend(loc="upper left",fontsize=8.6,facecolor=bg,edgecolor="#444",labelcolor=fg)
B=ax[1]; ly=9.4607e17; G=6.674e-8; cc=2.998e10
rhoc=3*(H0/3.0857e19)**2/(8*np.pi*G)
R=np.linspace(26.5,29.6,50)
B.plot(R,R+np.log10(cc**2/(2*G)),color="#ff6e6e",lw=2,label="Schwarzschild line (black holes)")
B.plot(R,np.log10(4/3*np.pi*rhoc)+3*R,color="#ce93d8",lw=2,label=f"critical density, {rhoc:.1e} g/cm³ (≈5 atoms/m³)")
for r,col,lab,dy in [(now(RH),"#ffd54f","Hubble sphere",-0.55),(now(EH),"#ff6e6e","event horizon",0.25),(now(PH),"#4dd0e1","observable universe",0.25)]:
  lr=np.log10(r*1e9*ly); lm=np.log10(4/3*np.pi*rhoc)+3*lr
  B.plot([lr],[lm],"o",color=col,ms=8); B.text(lr-0.05,lm+dy,f"{lab}\n{r:.1f} Gly",color=col,ha="right",fontsize=9)
B.axvline(28.14,color="#ffd54f",lw=0.6,ls=":",alpha=0.6)
B.set_xlim(26.5,29.6); B.set_ylim(54,58.5)
B.set_xlabel("log radius (cm)",color=fg); B.set_ylabel("log mass (g)",color=fg)
B.set_title("Where they sit on the triangle today",color=fg,fontsize=12)
B.text(26.6,58.1,"forbidden for a lump of mass:\nit would be inside its own horizon",color="#ff9e9e",fontsize=8.5,va="top")
B.legend(loc="lower right",fontsize=8.6,facecolor=bg,edgecolor="#444",labelcolor=fg)
for x in ax:
  x.tick_params(colors=fg); [s.set_color("#555") for s in x.spines.values()]; x.grid(color="#ffffff",alpha=0.06)
plt.tight_layout(); plt.savefig("/home/user/Triangle-of-Everything/docs/img/cosmic-horizons.png",dpi=130,facecolor=bg)
