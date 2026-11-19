// Additional problem structures registered after the original 88 families.
export function registerMathExpansion({f,A,N,D,G,int,pick,numeric,near,fmt,term,frac,table}) {
 f('parameter-no-solution',A,'one','hard',()=>{
  const a=int(2,14),b=int(2,18),c=int(1,20),d=a*b+c+int(1,20)
  return numeric(`The equation $${a}(x+${b})+${c}=kx+${d}$ has no solution. What is $k$?`,a,
   `The left side expands to $${a}x+${a*b+c}$. No solution occurs when the variable coefficients agree but the constants differ. Thus $k=${a}$ leaves the false statement $${a*b+c}=${d}$. Any other coefficient gives one solution.`,v=>near(v,a)&&!near(a*b+c,d),[a*b,a*b+c,d])
 })
 f('system-linear-combination',A,'system','hard',()=>{
  const a=int(2,9),b=int(2,9),t=int(2,6),x=int(-8,18),y=int(-8,18),c=a*x+b*y,d=(a+1)*x+b*y
  const u=a+t*(a+1),v=b*(1+t)
  return numeric(`The numbers $x$ and $y$ satisfy $${a}x+${b}y=${c}$ and $${a+1}x+${b}y=${d}$. What is $${u}x+${v}y$?`,c+t*d,
   `Add the first equation to $${t}$ times the second. The left side becomes $${u}x+${v}y$ and the right side is $${c}+${t}(${d})=${c+t*d}$. The target combines both equations; multiplying just one does not produce both required coefficients.`,ans=>{const sx=d-c,sy=(c-a*sx)/b;return near(u*sx+v*sy,ans)},[c+d,t*(c+d),c-t*d])
 })
 f('perpendicular-standard-parameter',A,'two','medium',()=>{
  const a=int(2,12),b=int(2,12),t=int(2,10),c=int(5,50),d=int(5,50)
  return numeric(`The lines $${a}x+${b}y=${c}$ and $${b*t}x+ky=${d}$ are perpendicular. What is $k$?`,-a*t,
   `The first slope is $-${frac(a,b)}$. A perpendicular slope is $${frac(b,a)}$. The second slope is $-${frac(b*t,'k')}$, so $-${frac(b*t,'k')}=${frac(b,a)}$, giving $k=-${a*t}$. Perpendicular slopes are negative reciprocals, not equal slopes.`,v=>v!==0&&near((-a/b)*(-b*t/v),-1),[a*t,b*t,-b*t])
 })
 f('transformed-linear-intercept',A,'linear','hard',()=>{
  const m=int(2,12),b=int(-25,25),h=int(2,15),k=int(2,9),c=int(2,20)
  return numeric(`Let $f(x)=${m}x${term(b)}$ and $g(x)=${k}f(x-${h})+${c}$. What is the $y$-intercept of the graph of $g$?`,k*(b-m*h)+c,
   `The $y$-intercept is $g(0)=${k}f(-${h})+${c}$. Since $f(-${h})=${b-m*h}$, this is $${k}(${b-m*h})+${c}=${k*(b-m*h)+c}$. Apply the shift inside $f$ before the outside scaling and addition.`,v=>near(v,k*(m*(-h)+b)+c),[k*b+c,k*(b+m*h)+c,b-m*h+c])
 })
 f('quadratic-root-distance',N,'nonlinear','hard',()=>{
  const a=int(2,8),r=int(-18,10),s=int(r+2,r+24)
  return numeric(`The equation $${a}x^2${term(-a*(r+s))}x${term(a*r*s)}=0$ has real solutions $r$ and $s$, where $r<s$. What is $s-r$?`,s-r,
   `The root sum is $${r+s}$ and the product is $${r*s}$. Thus $(s-r)^2=(r+s)^2-4rs=${(s-r)**2}$. Since $s>r$, take the positive root to obtain $s-r=${s-r}$. The discriminant must also be divided by the square of the leading coefficient.`,v=>v>0&&near(v*v,(r+s)**2-4*r*s),[r+s,s-r+1,a*(s-r)])
 })
 f('quadratic-root-square-sum',N,'nonlinear','hard',()=>{
  const a=int(2,8),r=int(-14,14),s=int(r+1,r+18)
  return numeric(`The roots of $${a}x^2${term(-a*(r+s))}x${term(a*r*s)}=0$ are $r$ and $s$. What is $r^2+s^2$?`,r*r+s*s,
   `Use $r+s=${r+s}$ and $rs=${r*s}$. Then $r^2+s^2=(r+s)^2-2rs=${(r+s)**2}-2(${r*s})=${r*r+s*s}$. Squaring the sum alone includes an extra $2rs$ term.`,v=>near(v+2*r*s,(r+s)**2),[(r+s)**2,2*r*s,r*r+s*s+1])
 })
 f('quadratic-root-ratio',N,'nonlinear','hard',()=>{
  const a=int(2,9),r=int(2,16),ratio=int(2,7),s=r*ratio
  return numeric(`The equation $${a}x^2+bx+${a*r*s}=0$ has two positive roots. The larger root is $${ratio}$ times the smaller root. What is $b$?`,-a*(r+s),
   `Let the smaller root be $t$; the larger is $${ratio}t$. Their product is $${ratio}t^2=${frac(a*r*s,a)}=${r*s}$, so $t=${r}$. Their sum is $${r+s}$, and $b=-${a}(${r+s})=-${a*(r+s)}$. The sign is negative because both roots are positive.`,v=>{const small=Math.sqrt((a*r*s/a)/ratio);return near(-v/a,small*(1+ratio))},[a*(r+s),-(r+s),-a*r*s])
 })
 f('discriminant-integer-bound',N,'nonlinear','hard',()=>{
  const a=int(2,12),h=int(2,22),bound=a*h*h
  return numeric(`For $${a}x^2-${2*a*h}x+k=0$ to have two distinct real solutions, what is the greatest possible integer value of $k$?`,bound-1,
   `Two distinct real roots require $(${2*a*h})^2-4(${a})k>0$, or $k<${bound}$. The greatest integer strictly below that bound is $${bound-1}$. At $k=${bound}$ the roots coincide.`,v=>Number.isInteger(v)&&(2*a*h)**2-4*a*v>0&&((2*a*h)**2-4*a*(v+1)<=0),[bound,bound+1,h*h-1])
 })
 f('radical-extraneous-root',N,'nonlinear','hard',()=>{
  const a=int(2,12),h=int(1,18),d=int(1,14),r=h+a+d,s=h-d,c=a*d+d*d-a*h
  return numeric(`What is the real solution of $\\sqrt{${a}x${term(c)}}=x-${h}$?`,r,
   `The right side must be nonnegative, so $x\\ge ${h}$. Squaring gives roots $${r}$ and $${s}$. Reject $${s}$ because its right side is $-${d}$. Substituting $${r}$ gives $\\sqrt{${(a+d)**2}}=${a+d}$ on both sides, so the solution is $${r}$. Squaring can introduce an extraneous root.`,v=>v>=h&&a*v+c>=0&&near(Math.sqrt(a*v+c),v-h),[s,r+s,r-s])
 })
 f('absolute-root-sum',N,'nonlinear','medium',()=>{
  const a=int(2,10),h=int(2,20),d=int(2,20)
  return numeric(`The equation $|${a}x-${a*h}|=${d}$ has two real solutions. What is their sum?`,2*h,
   `The two equations are $${a}x-${a*h}=${d}$ and $${a}x-${a*h}=-${d}$. Their solutions are $${h}+${frac(d,a)}$ and $${h}-${frac(d,a)}$, whose sum is $${2*h}$. Both absolute-value branches must be included.`,v=>near(v,(a*h+d)/a+(a*h-d)/a),[h,2*d,2*a*h])
 })
 f('quadratic-input-translation',N,'equivalent','hard',()=>{
  const a=int(2,10),b=int(-20,20),c=int(1,35),h=int(2,18),constant=a*h*h+b*h+c
  return numeric(`Let $f(x)=${a}x^2${term(b)}x+${c}$ and $g(x)=f(x+${h})$. When $g(x)$ is expanded as $${a}x^2+kx+${constant}$, what is $k$?`,2*a*h+b,
   `Expand $${a}(x+${h})^2${term(b)}(x+${h})+${c}$. The linear contributions are $${2*a*h}x$ and $${b}x$, so $k=${2*a*h+b}$. Shifting the input creates a cross term from the square.`,v=>[-3,1,4].every(x=>near(a*(x+h)**2+b*(x+h)+c,a*x*x+v*x+constant)),[b,a*h+b,2*a*h-b])
 })
 f('vertex-parameter-from-point',N,'function','hard',()=>{
  const a=int(2,12),h=int(-15,15),k=int(-20,30),d=int(2,12),value=a*d*d+k
  return numeric(`A quadratic function has vertex $(${h},${k})$ and passes through $(${h+d},${value})$. If $f(x)=a(x${term(-h)})^2${term(k)}$, what is $a$?`,a,
   `Substitute the second point into vertex form: $${value}=a(${d})^2${term(k)}$. Hence $a=${frac(value-k,d*d)}=${a}$. The horizontal distance from the vertex is squared.`,v=>v>0&&near(v*((h+d)-h)**2+k,value),[a*d,a*d*d,(value-k)/d])
 })
 f('quadratic-second-difference',N,'function','hard',()=>{
  const a=int(2,12),b=int(-15,15),c=int(-25,25),h=int(2,9),x=int(-8,8),evalAt=t=>a*t*t+b*t+c
  return numeric(`The table gives three values of $f(x)=ax^2+bx+c$. What is $a$?`,a,
   `For equally spaced inputs with step $${h}$, the second difference is $2a(${h})^2$. Here it is $${evalAt(x+2*h)}-2(${evalAt(x+h)})+(${evalAt(x)})=${2*a*h*h}$. Divide by $2(${h})^2=${2*h*h}$ to obtain $a=${a}$. A first difference alone does not isolate the quadratic coefficient.`,v=>near(2*v*h*h,evalAt(x+2*h)-2*evalAt(x+h)+evalAt(x)),[2*a,a*h*h,a*h],{passage:table(['$x$','$f(x)$'],[x,x+h,x+2*h].map(t=>[t,evalAt(t)]))})
 })
 f('exponential-nonzero-inputs',N,'function','hard',()=>{
  const a=int(2,30),b=int(2,5),t=int(2,4),d=int(2,3),first=a*b**t,second=a*b**(t+d)
  return numeric(`A function has the form $f(x)=ab^x$, where $a>0$ and $b>0$. If $f(${t})=${first}$ and $f(${t+d})=${second}$, what is $f(0)$?`,a,
   `Divide the outputs: $b^{${d}}=${frac(second,first)}=${b**d}$, so the positive base is $b=${b}$. Then $a=${frac(first,`${b}^{${t}}`)}=${a}$. Finally $f(0)=a=${a}$. A value at a nonzero input is not automatically the initial value.`,v=>v>0&&near(v*(second/first)**(t/d),first),[b,first,first/b])
 })
 f('rational-hole-extension',N,'function','hard',()=>{
  const h=int(2,22),b=int(2,22)
  return numeric(`For $x\\ne ${h}$, $f(x)=${frac(`x^2${term(b-h)}x-${h*b}`,`x-${h}`)}$. A linear function $g$ agrees with $f$ at every input where $f$ is defined. What is $g(${h})$?`,h+b,
   `Factor the numerator as $(x-${h})(x+${b})$. For allowed inputs, $f(x)=x+${b}$, so the agreeing linear function is $g(x)=x+${b}$. Therefore $g(${h})=${h+b}$. The original $f$ is still undefined at $${h}$; the question asks about $g$.`,v=>[0,h+1].every(x=>near((v-h+x)*(x-h),x*x+(b-h)*x-h*b)),[h,b,h*b])
 })
 f('rational-identity-coefficient',N,'equivalent','hard',()=>{
  const a=int(2,12),b=int(2,16),h=int(2,16),middle=b-a*h
  return numeric(`For $x\\ne ${h}$, $${frac(`${a}x^2+kx-${b*h}`,`x-${h}`)}=${a}x+${b}$. What is $k$?`,middle,
   `Multiply by $x-${h}$ to obtain the numerator $(x-${h})(${a}x+${b})=${a}x^2+(${b}-${a*h})x-${b*h}$. Thus $k=${middle}$. Cancellation must follow a factorization, not term-by-term deletion.`,v=>[h+1,h+3,-2].every(x=>near(a*x*x+v*x-b*h,(x-h)*(a*x+b))),[b+a*h,a*h-b,b*h])
 })
 f('reciprocal-root-sum',N,'nonlinear','hard',()=>{
  const a=int(2,8),r=int(2,18),s=int(r+1,r+16)
  return numeric(`The roots of $${a}x^2-${a*(r+s)}x+${a*r*s}=0$ are $r$ and $s$. What is $${frac(1,'r')}+${frac(1,'s')}$?`,(r+s)/(r*s),
   `Combine the fractions: $1/r+1/s=(r+s)/(rs)$. The quadratic gives $r+s=${r+s}$ and $rs=${r*s}$, so the answer is $${frac(r+s,r*s)}$. Adding reciprocals is not the reciprocal of the sum.`,v=>near(v*r*s,r+s),[1/(r+s),r*s/(r+s),(r+s)/(a*r*s)])
 })
 f('transformed-quadratic-roots',N,'function','hard',()=>{
  const a=int(2,8),r=int(-10,8),s=int(r+1,r+16),h=int(2,14),k=int(2,6)
  return numeric(`Let $f(x)=${a}(x${term(-r)})(x${term(-s)})$ and $g(x)=f(${k}x-${h})$. What is the sum of the two real zeros of $g$?`,(r+s+2*h)/k,
   `The inputs to $f$ that make it zero are $${r}$ and $${s}$. Hence $${k}x-${h}=${r}$ or $${k}x-${h}=${s}$. Adding the resulting roots gives $${frac(r+s+2*h,k)}$. The input shift affects both roots, and the input scale divides them.`,v=>{const x1=(r+h)/k,x2=(s+h)/k;return near((k*x1-h-r)*(k*x1-h-s),0)&&near((k*x2-h-r)*(k*x2-h-s),0)&&near(v,x1+x2)},[r+s+2*h,(r+s+h)/k,(r+s-2*h)/k])
 })
 f('chord-distance',G,'circles','hard',()=>{
  const [a,b,c]=pick([[3,4,5],[5,12,13],[8,15,17],[7,24,25]]),k=int(2,25)
  return numeric(`A circle has radius $${c*k}$. A chord has length $${2*b*k}$. What is the perpendicular distance from the center to the chord?`,a*k,
   `The perpendicular from the center bisects the chord, giving a right triangle with hypotenuse $${c*k}$ and one leg $${b*k}$. The distance is $\\sqrt{(${c*k})^2-(${b*k})^2}=${a*k}$. Use half the chord, not the full chord.`,v=>v>0&&near(v*v+(b*k)**2,(c*k)**2),[b*k,c*k-a*k,2*a*k])
 })
 f('tangent-segment',G,'circles','hard',()=>{
  const [a,b,c]=pick([[3,4,5],[5,12,13],[8,15,17],[7,24,25]]),k=int(2,25)
  return numeric(`Point $P$ is $${c*k}$ units from a circle's center. The circle has radius $${a*k}$. A line from $P$ is tangent to the circle at $T$. What is $PT$?`,b*k,
   `The radius to a point of tangency is perpendicular to the tangent. Thus $PT^2=(${c*k})^2-(${a*k})^2=${(b*k)**2}$, so $PT=${b*k}$. Subtracting lengths rather than their squares does not use the right triangle correctly.`,v=>v>0&&near(v*v+(a*k)**2,(c*k)**2),[(c-a)*k,(c+a)*k,c*k])
 })
 f('circle-axis-tangency',G,'circles','hard',()=>{
  const h=int(2,25),k=int(2,25)
  return numeric(`The circle $x^2+y^2-${2*h}x-${2*k}y+c=0$ is tangent to the $x$-axis. What is $c$?`,h*h,
   `Complete squares: $(x-${h})^2+(y-${k})^2=${h*h+k*k}-c$. The center is $(${h},${k})$ and tangency to the $x$-axis means radius $${k}$. Therefore $${h*h+k*k}-c=${k*k}$, giving $c=${h*h}$. Distance to the $x$-axis uses the center's $y$-coordinate.`,v=>near(h*h+k*k-v,k*k)&&h*h+k*k-v>0,[k*k,h*h+k*k,h*h-k*k])
 })
 f('inscribed-angle',G,'circles','medium',()=>{
  const angle=int(12,82),r=int(3,30)
  return numeric(`In a circle of radius $${r}$, an inscribed angle intercepts the same arc as a central angle measuring $${2*angle}^\\circ$. What is the inscribed angle's measure, in degrees?`,angle,
   `An inscribed angle is half the central angle intercepting the same arc. Its measure is $${2*angle}/2=${angle}^\\circ$. The radius does not affect this angular relationship.`,v=>near(2*v,2*angle),[2*angle,4*angle,180-angle])
 })
 f('complementary-trig-parameter',G,'trig','hard',()=>{
  const a=int(2,7),b=int(2,7),x=int(2,5),c=int(2,12),d=90-(a+b)*x-c
  return numeric(`Angles $A$ and $B$ are acute, $\\sin A=\\cos B$, $A=(${a}x+${c})^\\circ$, and $B=(${b}x${term(d)})^\\circ$. What is $x$?`,x,
   `For acute angles, $\\sin A=\\cos B$ means $A+B=90^\\circ$. Thus $${a+b}x${term(c+d)}=90$, giving $x=${x}$. Using supplementary angles would produce the wrong equation.`,v=>{const A=a*v+c,B=b*v+d;return A>0&&A<90&&B>0&&B<90&&near(Math.sin(A*Math.PI/180),Math.cos(B*Math.PI/180))},[(180-c-d)/(a+b),90-c-d,x+1])
 })
 f('similar-area-to-side',G,'angles','hard',()=>{
  const a=int(2,8),b=int(a+1,a+9),s=int(2,12),area=int(2,16)
  return numeric(`Two similar triangles have areas $${area*a*a}$ and $${area*b*b}$ square units. A side of the smaller triangle has length $${a*s}$. What is the corresponding side length of the larger triangle?`,b*s,
   `The area ratio is $${frac(b*b,a*a)}$, so the side ratio is its positive square root, $${frac(b,a)}$. The required side is $${a*s}(${frac(b,a)})=${b*s}$. Applying the area ratio directly to a side over-scales it.`,v=>v>0&&near((v/(a*s))**2,(area*b*b)/(area*a*a)),[b*b*s/a,a*s,a*b*s])
 })
 f('truncated-cone-volume',G,'area','hard',()=>{
  const r=int(2,8),ratio=int(2,5),R=r*ratio,h=int(2,8)*3,H=h*ratio
  const coefficient=(R*R*H-r*r*h)/3
  return numeric(`A cone of radius $${R}$ and height $${H}$ has a smaller similar cone removed from its tip. The removed cone has radius $${r}$. The remaining solid has volume $k\\pi$. What is $k$?`,coefficient,
   `Similarity gives the removed cone height $${H}(${frac(r,R)})=${h}$. Subtract cone volumes: $k=${frac(`${R}^2(${H})-${r}^2(${h})`,3)}=${coefficient}$. The removed cone is shorter as well as narrower; using the original height for it is incorrect.`,v=>near(3*v+r*r*(H*r/R),R*R*H),[(R*R-r*r)*H/3,R*R*H/3,coefficient*3])
 })
 f('sphere-area-to-volume-ratio',G,'area','hard',()=>{
  const r=int(2,90)
  return numeric(`A sphere has surface area $${4*r*r}\\pi$ square units. What is its volume divided by its surface area, in units?`,r/3,
   `Surface area $4\\pi r^2=${4*r*r}\\pi$ gives $r=${r}$. The ratio of volume to surface area is $${frac('\\frac43\\pi r^3','4\\pi r^2')}=r/3=${frac(r,3)}$. The common $\\pi r^2$ factor cancels; area and volume are not numerically interchangeable.`,v=>v>0&&near(4*(3*v)**2,4*r*r),[r,3*r,r*r/3])
 })
 f('combined-mean-group-size',D,'data','hard',()=>{
  const a=int(10,30),d=int(2,12),n=int(3,20),ratio=int(2,5),m=n*ratio,b=a+d*(ratio+1),combined=a+d*ratio
  return numeric(`A group of $${n}$ measurements has mean $${a}$. A second group has mean $${b}$. The combined mean is $${combined}$. How many measurements are in the second group?`,m,
   `Let the unknown count be $m$. Total sums give $${n*a}+${b}m=${combined}(${n}+m)$. Thus $${b-combined}m=${n*(combined-a)}$ and $m=${m}$. Group means must be weighted by group sizes.`,v=>v>0&&near((n*a+v*b)/(n+v),combined),[n,n+m,ratio])
 })
 f('dilution-to-target',D,'percent','hard',()=>{
  const ratio=int(2,6),target=int(3,12),start=ratio*target,volume=int(3,20)*10,water=volume*(ratio-1)
  return numeric(`A solution contains $${start}\\%$ salt by volume. There are $${volume}$ liters of solution. How many liters of pure water must be added to reduce the concentration to $${fmt(target)}\\%$? Assume volumes add.`,water,
   `The salt amount stays $${fmt(volume*start/100)}$ liters. With $w$ liters of added water, $${frac(fmt(volume*start/100),`${volume}+w`)}=${frac(start,100*ratio)}$. The total volume must be $${volume*ratio}$, so add $${water}$ liters. Adding water changes the denominator, not the amount of salt.`,v=>v>=0&&near((volume*start/100)/(volume+v),start/(100*ratio)),[volume*ratio,volume/ratio,volume*(1-1/ratio)])
 })
 f('mean-zero-residual-intercept',D,'model','hard',()=>{
  const slope=int(2,12),b=int(3,30),x=int(2,10),d=int(2,6),r=int(2,15)
  const xs=[x,x+d,x+2*d],ys=[slope*xs[0]+b+r,slope*xs[1]+b-2*r,slope*xs[2]+b+r]
  return numeric(`A linear model $\\hat y=${slope}x+b$ is chosen so that the sum of observed-minus-predicted residuals for the table is zero. What is $b$?`,b,
   `Sum the residuals: $(${ys.join('+')})-${slope}(${xs.join('+')})-3b=0$. Therefore $3b=${3*b}$ and $b=${b}$. A zero sum permits individual residuals to be positive or negative; it does not require every point to lie on the line.`,v=>near(xs.reduce((sum,x,i)=>sum+ys[i]-(slope*x+v),0),0),[b+r,b-2*r,3*b],{passage:table(['$x$','Observed $y$'],xs.map((x,i)=>[x,ys[i]]))})
 })
 f('bayes-two-groups',D,'probability','hard',()=>{
  const p=int(2,8)*10,a=int(2,8)*10,b=int(1,7)*10,first=p*a,second=(100-p)*b
  return numeric(`A shipment contains $${p}\\%$ items from factory A and the rest from factory B. Of A's items, $${a}\\%$ pass a test; of B's items, $${b}\\%$ pass. An item is selected at random from all items that pass. What is the probability that it came from A?`,first/(first+second),
   `In a representative batch of 10,000 items, A contributes $${first}$ passing items and B contributes $${second}$. Restrict the denominator to passing items: $P(A\\mid\\text{pass})=${frac(first,first+second)}$. The original factory share is not the conditional share among passing items.`,v=>near(v*(first+second),first),[p/100,a/100,first/10000])
 })
 f('area-unit-density',D,'ratio','hard',()=>{
  const mass=int(2,18),area=pick([2,4,5,8,10,16,20,25])
  return numeric(`A thin sheet has mass $${mass}$ grams and area $${area}$ square centimeters. What is its mass per square meter, in grams per square meter?`,mass*10000/area,
   `One square meter contains $100^2=10{,}000$ square centimeters. Multiply $${frac(mass,area)}$ grams per square centimeter by $10{,}000$ to obtain $${frac(mass*10000,area)}$ grams per square meter. Area conversion squares the length-conversion factor.`,v=>near(v*area/10000,mass),[mass*100/area,mass/(area*10000),mass*area])
 })
 f('reverse-two-price-changes',D,'percent','hard',()=>{
  const original=int(5,100)*100,p=int(2,6)*5,q=int(2,6)*5,final=original*(100+p)*(100-q)/10000
  return numeric(`An item's price first increased by $${p}\\%$ and then decreased by $${q}\\%$ of the increased price. Its final price was \\$${fmt(final)}. What was the original price, in dollars?`,original,
   `If the original price is $P$, then $P(${fmt(1+p/100)})(${fmt(1-q/100)})=${fmt(final)}$. Divide by both multipliers to obtain $P=${original}$. Applying the opposite percentages in reverse does not undo a percent change; division does.`,v=>near(v*(1+p/100)*(1-q/100),final),[final*(1-p/100)*(1+q/100),final/(1+(p-q)/100),final])
 })
}
