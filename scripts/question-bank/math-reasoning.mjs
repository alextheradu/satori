// New structures appended after the first 120 families to preserve existing choices.
export function registerMathReasoning({f,A,N,D,G,int,pick,numeric,near,fmt,term,frac,table}) {
 f('tiered-usage-fee',A,'linear','medium',()=>{
  const base=int(12,45),included=int(3,12),rate=int(2,9),extra=int(3,25),cost=base+rate*extra
  return numeric(`A rental costs \\$${base} for up to $${included}$ hours and \\$${rate} for each additional hour. A customer pays \\$${cost} for a whole number of hours. For how many hours did the customer rent the item?`,included+extra,
   `The charge above the base fee is $${cost}-${base}=${rate*extra}$ dollars. This pays for $${extra}$ additional hours. Add the $${included}$ included hours to obtain $${included+extra}$. The per-hour rate applies only after the included period.`,v=>v>included&&near(base+rate*(v-included),cost),[extra,cost/rate,included+extra+1])
 })
 f('strict-plan-last-integer',A,'inequality','hard',()=>{
  const rate=int(3,12),gap=int(2,8),base=int(4,25),threshold=int(5,35),other=base+gap*threshold
  return numeric(`For a positive integer $n$, plan A costs $${rate+gap}n+${base}$ dollars and plan B costs $${rate}n+${other}$ dollars. What is the greatest value of $n$ for which plan A costs strictly less than plan B?`,threshold-1,
   `The strict comparison gives $${gap}n<${other-base}$, so $n<${threshold}$. The greatest integer allowed is $${threshold-1}$; at $${threshold}$ the plans cost the same.`,v=>Number.isInteger(v)&&v>0&&(rate+gap)*v+base<rate*v+other&&(rate+gap)*(v+1)+base>=rate*(v+1)+other,[threshold,threshold+1,other-base])
 })
 f('compound-integer-count',A,'inequality','hard',()=>{
  const lo=int(-20,5),width=int(4,22),hi=lo+width,a=int(2,8),b=int(1,17)
  return numeric(`How many integer values of $x$ satisfy $${a*lo+b}<${a}x+${b}\\le ${a*hi+b}$?`,width,
   `Subtract $${b}$ and divide by the positive number $${a}$ to obtain $${lo}<x\\le ${hi}$. The integers are $${lo+1}$ through $${hi}$, giving $${hi}-(${lo+1})+1=${width}$. The lower endpoint is excluded and the upper endpoint is included.`,v=>near(v,Array.from({length:hi-lo+5},(_,i)=>lo-2+i).filter(x=>a*lo+b<a*x+b&&a*x+b<=a*hi+b).length),[width+1,width-1,a*width])
 })
 f('unique-system-exception',A,'system','hard',()=>{
  const a=int(2,12),b=int(2,15),multiple=int(2,9),c=int(3,40),d=c*multiple+int(1,20)
  return numeric(`The system $${a}x+${b}y=${c}$ and $${a*multiple}x+ky=${d}$ has exactly one solution for every value of $k$ except one. What is that exceptional value?`,b*multiple,
   `The lines have proportional variable coefficients when $k=${b}(${multiple})=${b*multiple}$. Their constants are not proportional, so at that value they are parallel distinct lines. For every other value, the coefficient determinant is nonzero and the lines intersect once.`,v=>near(a*v-b*a*multiple,0)&&!near(d,c*multiple),[b,multiple,d/c])
 })
 f('intercept-midpoint-sum',A,'two','hard',()=>{
  const a=int(2,11),b=int(2,12),t=int(2,15),c=2*a*b*t
  return numeric(`A line has equation $${a}x+${b}y=${c}$. Point $M$ is the midpoint of the segment joining the line’s two axis intercepts. What is the sum of the coordinates of $M$?`,(a+b)*t,
   `The intercepts are $(${c/a},0)$ and $(0,${c/b})$. Their midpoint is $(${b*t},${a*t})$, whose coordinate sum is $${(a+b)*t}$. Each coordinate must be averaged separately.`,v=>near(v,(c/a+0)/2+(0+c/b)/2),[c/a+c/b,a*t,b*t])
 })
 f('translated-line-zero',A,'two','hard',()=>{
  const m=int(2,9),B=int(-12,15),h=int(2,15),K=int(2,14),b=m*B,k=m*K
  return numeric(`The graph of $y=${m}x${term(b)}$ is translated $${h}$ units to the right and $${k}$ units up. What is the $x$-coordinate of the translated graph’s $x$-intercept?`,h-B-K,
   `The translated line is $y=${m}(x-${h})${term(b)}+${k}$. Set $y=0$ and solve: $x=${h}-${B}-${K}=${h-B-K}$. A rightward translation changes the input, while an upward translation changes the output.`,v=>near(-k,m*(v-h)+b),[h+B+K,-B,h-B+K])
 })
 f('linear-self-composition',A,'linear','medium',()=>{
  const m=int(2,12),b=int(-18,25)
  return numeric(`The function $f$ is defined by $f(x)=${m}x${term(b)}$. What is $f(f(0))$?`,m*b+b,
   `First, $f(0)=${b}$. Use this output as the next input: $f(${b})=${m}(${b})${term(b)}=${m*b+b}$. The notation means applying the function twice, not squaring its first output.`,v=>near(v,m*(m*0+b)+b),[b,b*b,m*b])
 })
 f('average-cost-minimum-count',A,'one','hard',()=>{
  const per=int(2,12),gap=int(2,9),minimum=int(5,30),fixed=gap*minimum-int(1,gap-1)
  return numeric(`Producing $n$ items costs $${fixed}+${per}n$ dollars, where $n$ is a positive integer. What is the least number of items that must be produced so that the average cost per item is at most $${per+gap}$ dollars?`,minimum,
   `Divide the total cost by $n$: $${frac(fixed,'n')}+${per}\\le ${per+gap}$. Since $n>0$, this is $n\\ge ${frac(fixed,gap)}$. Rounding up gives $${minimum}$ items. The fixed fee is spread over all items.`,v=>Number.isInteger(v)&&v>0&&(fixed+per*v)/v<=per+gap&&(v===1||(fixed+per*(v-1))/(v-1)>per+gap),[minimum-1,fixed,minimum+1])
 })

 f('quadratic-tangent-intercept',N,'nonlinear','hard',()=>{
  const a=int(2,9),h=int(-10,10),k=int(-20,25),d=int(2,9),m=2*a*d,b=k-m*h-a*d*d
  return numeric(`The line $y=${m}x+b$ intersects the parabola $y=${a}(x${term(-h)})^2${term(k)}$ at exactly one point. What is $b$?`,b,
   `Equating the expressions produces a quadratic. In $u=x-${h}$ it is $${a}u^2-${m}u+(${k}-${m*h}-b)=0$. One intersection requires discriminant zero, giving $b=${k}-${m*h}-${a*d*d}=${b}$. A tangent corresponds to a repeated root.`,v=>near(m*m-4*a*(k-m*h-v),0),[k-m*h+a*d*d,k-m*h,k+a*d*d])
 })
 f('exponential-vertical-offset',N,'function','hard',()=>{
  const a=int(2,25),b=int(2,6),c=int(-25,30),y0=a+c,y1=a*b+c,y2=a*b*b+c
  return numeric('The table gives values of $f(x)=ab^x+c$, where $a>0$ and $b>1$. What is $c$?',c,
   `Consecutive differences are $${y1-y0}$ and $${y2-y1}$. Their ratio gives $b=${b}$. Then $a=${frac(y1-y0,b-1)}=${a}$ and $c=f(0)-a=${y0}-${a}=${c}$. Ratios of the raw outputs do not give $b$ when a vertical offset is present.`,v=>y0-v>0&&near((y1-v)**2,(y0-v)*(y2-v)),[a,y0,c+1],{passage:table(['$x$','$f(x)$'],[[0,y0],[1,y1],[2,y2]])})
 })
 f('three-sided-enclosure-maximum',N,'function','hard',()=>{
  const unit=int(4,90),length=4*unit
  return numeric(`A rectangular enclosure is built against a straight wall, so fencing is needed on only three sides. Exactly $${length}$ meters of fencing is used. What is the greatest possible enclosed area, in square meters?`,2*unit*unit,
   `Let $w$ be each side perpendicular to the wall. The other fenced side has length $${length}-2w$, so area is $w(${length}-2w)=-2(w-${unit})^2+${2*unit*unit}$. Its maximum is $${2*unit*unit}$ when $w=${unit}$. Four-sided fencing would produce a different constraint.`,v=>{const w=length/4,l=length-2*w;return near(v,w*l)&&w>0&&l>0},[unit*unit,length*length/4,2*unit*unit+1])
 })
 f('biquadratic-positive-root',N,'nonlinear','hard',()=>{
  const a=int(2,15),b=int(a+1,a+15)
  return numeric(`What is the smaller positive solution of $x^4-${a*a+b*b}x^2+${a*a*b*b}=0$?`,a,
   `Treat the equation as quadratic in $x^2$: $(x^2-${a*a})(x^2-${b*b})=0$. Thus the real solutions are $\\pm ${a}$ and $\\pm ${b}$. The smaller positive solution is $${a}$, not its square.`,v=>v>0&&near(v**4-(a*a+b*b)*v*v+a*a*b*b,0)&&v<b,[b,a*a,-a])
 })
 f('difference-cubes-identity',N,'equivalent','hard',()=>{
  const a=int(2,12),r=int(2,30)
  return numeric(`The identity $(${a}x-${r})(${a*a}x^2+kx+${r*r})=${a**3}x^3-${r**3}$ holds for all real $x$. What is $k$?`,a*r,
   `Use $(u-v)(u^2+uv+v^2)=u^3-v^3$ with $u=${a}x$ and $v=${r}$. The middle term is $${a*r}x$, so $k=${a*r}$. The mixed terms cancel only with this coefficient.`,v=>[-3,0,2,5].every(x=>near((a*x-r)*(a*a*x*x+v*x+r*r),a**3*x**3-r**3)),[-a*r,a+r,r*r])
 })
 f('cubic-coefficient-from-values',N,'equivalent','hard',()=>{
  const a=int(2,9),b=int(-20,25),c=int(-25,30),r=int(-6,3),s=int(r+2,r+8),at=x=>x**3+a*x*x+b*x+c
  return numeric(`Let $p(x)=x^3+${a}x^2+bx+c$. If $p(${r})=${at(r)}$ and $p(${s})=${at(s)}$, what is $b$?`,b,
   `Substitute both inputs and subtract the resulting equations to eliminate $c$. This gives $${s-r}b=${at(s)-at(r)}-(${s**3-r**3})-${a}(${s*s-r*r})=${b*(s-r)}$. Divide by $${s-r}$ to get $b=${b}$.`,v=>near(at(s)-at(r),s**3-r**3+a*(s*s-r*r)+v*(s-r)),[-b,c,b+1])
 })
 f('reciprocal-cancellation-equation',N,'nonlinear','hard',()=>{
  const a=int(-18,15),d=int(2,18),b=a+2*d
  return numeric(`For $x\\ne ${a}$ and $x\\ne ${b}$, what value of $x$ satisfies $${frac(1,`x${term(-a)}`)}+${frac(1,`x${term(-b)}`)}=0$?`,a+d,
   `Combine the fractions. The numerator is $(x${term(-b)})+(x${term(-a)})=2x${term(-a-b)}$. It must be zero, so $x=${frac(a+b,2)}=${a+d}$. This midpoint is different from both excluded endpoints.`,v=>!near(v,a)&&!near(v,b)&&near(1/(v-a)+1/(v-b),0),[a,b,a+b])
 })
 f('quadratic-equal-output-axis',N,'function','hard',()=>{
  const h=int(-15,15),d=int(2,12),a=int(2,8),k=int(-20,30),value=a*d*d+k
  return numeric(`A quadratic function has $f(${h-d})=f(${h+d})=${value}$ and has a minimum value. At what input does the minimum occur?`,h,
   `The two distinct inputs have equal outputs, so they are symmetric about the parabola’s axis. Their midpoint is $${frac(`${h-d}+(${h+d})`,2)}=${h}$. Because a minimum exists, it occurs on that axis. The common output is not the minimum’s input.`,v=>near((h-d-v)**2,(h+d-v)**2),[value,h-d,h+d])
 })

 f('independent-at-least-one',D,'probability','hard',()=>{
  const p=int(1,8),q=int(1,8),value=1-(1-p/10)*(1-q/10)
  return numeric(`The probability that alarm A activates is $${fmt(p/10)}$, and the probability that alarm B activates is $${fmt(q/10)}$. The events are independent. What is the probability that at least one alarm activates?`,value,
   `Use the complement: neither activates with probability $(1-${fmt(p/10)})(1-${fmt(q/10)})=${fmt(1-value)}$. Therefore at least one activates with probability $1-${fmt(1-value)}=${fmt(value)}$. Adding the two probabilities alone counts joint activation twice.`,v=>near(v, p/10*(1-q/10)+(1-p/10)*q/10+p*q/100),[p/10+q/10,p*q/100,1-value])
 })
 f('conditional-count-from-percent',D,'probability','medium',()=>{
  const units=int(3,18),total=100*units,p=int(2,8)*10,q=int(2,8)*10,sub=total*p/100,joint=sub*q/100
  return numeric(`A survey includes $${total}$ people. Of all surveyed people, $${p}\\%$ commute by train. Of the train commuters, $${q}\\%$ also use a bicycle. How many surveyed people both commute by train and use a bicycle?`,joint,
   `There are $${total}(${p/100})=${sub}$ train commuters. Apply the conditional percentage to that subgroup: $${sub}(${q/100})=${joint}$. The second percentage is not a percentage of all surveyed people.`,v=>near(v/sub,q/100)&&near(sub/total,p/100),[total*q/100,sub,joint+units])
 })
 f('mean-after-removal',D,'data','hard',()=>{
  const remaining=int(6,24),removed=int(2,8),n=remaining+removed,low=int(5,20),delta=int(1,4),mean=low+remaining*delta,newMean=low+n*delta
  return numeric(`A data set of $${n}$ values has mean $${mean}$. Exactly $${removed}$ values, each equal to $${low}$, are removed. What is the mean of the remaining values?`,newMean,
   `The original sum is $${n}(${mean})=${n*mean}$. Remove $${removed}(${low})=${removed*low}$, leaving sum $${n*mean-removed*low}$ across $${n-removed}$ values. The new mean is $${frac(n*mean-removed*low,n-removed)}$. Both sum and count change.`,v=>near(v*(n-removed)+removed*low,n*mean),[(n*mean-removed*low)/n,mean-low,mean])
 })
 f('mean-frequency-missing-count',D,'data','hard',()=>{
  const low=int(2,15),step=int(2,9),left=int(3,12),right=left+int(1,8),middle=int(3,18),total=left+middle+right,sum=left*low+middle*(low+step)+right*(low+2*step),known=left*low+right*(low+2*step)
  return numeric(`The mean of the data described in the table is $${frac(sum,total)}$. What is the missing frequency $k$?`,middle,
   `The total is $${known}+${low+step}k$ and the count is $${left+right}+k$. Set their quotient equal to $${frac(sum,total)}$ and cross multiply. Solving gives $k=${middle}$. A frequency weights its value in the sum and also contributes to the number of observations.`,v=>Number.isInteger(v)&&v>0&&near((known+(low+step)*v)/(left+right+v),sum/total),[total,left+right,low+step],{passage:table(['Value','Frequency'],[[low,left],[low+step,'$k$'],[low+2*step,right]])})
 })
 f('model-unit-change-slope',D,'model','hard',()=>{
  const m=int(2,18),b=int(5,50),scale=pick([10,100,1000])
  return numeric(`A model predicts distance $d= ${m}t+${b}$, where $d$ is measured in meters and $t$ in minutes. The same predictions are written as $D=kt+c$, where $D$ is measured in units of $${scale}$ meters and $t$ remains in minutes. What is $k$?`,m/scale,
   `One new distance unit equals $${scale}$ meters, so divide the entire distance model by $${scale}$. The new slope is $${frac(m,scale)}$ new distance units per minute. The time unit has not changed.`,v=>near((v*7+b/scale)*scale,m*7+b)&&near((v*13+b/scale)*scale,m*13+b),[m*scale,m,b/scale])
 })
 f('interval-center-recovery',D,'inference','medium',()=>{
  const center=int(20,80),margin=int(2,12),lo=center-margin,hi=center+margin
  return numeric(`A poll’s reported interval extends from $${lo}\\%$ to $${hi}\\%$. The interval was formed by adding and subtracting the same margin of error from the sample percentage. What was the sample percentage?`,center,
   `The sample percentage is the midpoint: $(${lo}+${hi})/2=${center}$. The margin is $${margin}$ percentage points, which is half the width rather than the center.`,v=>near(v-lo,hi-v)&&v>=lo&&v<=hi,[margin,hi-lo,hi])
 })
 f('drain-refill-concentration',D,'percent','hard',()=>{
  const units=int(2,15),volume=20*units,removed=pick([5,10,15])*units,p=pick([20,40,60,80]),final=p*(volume-removed)/volume
  return numeric(`A well-mixed tank contains $${volume}$ liters of a solution that is $${p}\\%$ concentrate by volume. Some solution is removed and replaced by the same volume of pure water. The new solution is $${final}\\%$ concentrate. How many liters were removed?`,removed,
   `Initially the concentrate volume is $${volume*p/100}$ liters. Removing $r$ liters removes $${p/100}r$ liters of concentrate. The final volume stays $${volume}$, so $${volume*p/100}-${p/100}r=${volume*final/100}$. Solving gives $r=${removed}$. Removal takes out both water and concentrate.`,v=>v>=0&&v<=volume&&near((volume*p/100-v*p/100)/volume,final/100),[volume-removed,removed*p/100,volume*(p-final)/100])
 })
 f('ratio-after-adding-one-group',D,'ratio','hard',()=>{
  const a=int(2,9),b=int(2,9),t=int(3,20),extra=int(2,12),added=b*extra,first=a*t,second=b*t,newSecond=b*(t+extra)
  return numeric(`A box initially has red and blue counters in the ratio $${a}:${b}$. After $${added}$ blue counters are added, the ratio of red counters to blue counters is $${first}:${newSecond}$. How many red counters are in the box?`,first,
   `Write the original counts as $${a}u$ and $${b}u$. Then $${frac(`${a}u`,`${b}u+${added}`)}=${frac(first,newSecond)}$. Cross multiplication gives $u=${t}$, so the unchanged red count is $${first}$. The added counters change only the blue count.`,v=>v>0&&near(v/(v*b/a+added),first/newSecond),[second,added,first+a])
 })

 f('hypotenuse-altitude',G,'trig','hard',()=>{
  const [a,b,c]=pick([[3,4,5],[5,12,13],[8,15,17]]),scale=c*int(2,30)
  return numeric(`A right triangle has legs of lengths $${a*scale}$ and $${b*scale}$ and hypotenuse of length $${c*scale}$. What is the length of the altitude drawn from the right-angle vertex to the hypotenuse?`,a*b*scale/c,
   `Compute the area in two ways: $${frac(1,2)}(${a*scale})(${b*scale})=${frac(1,2)}(${c*scale})h$. Therefore $h=${frac(a*b*scale,c)}$. The altitude is not generally equal to either leg.`,v=>v>0&&near(c*scale*v/2,a*b*scale*scale/2),[a*scale,b*scale,c*scale/2])
 })
 f('similar-perimeter-difference',G,'angles','hard',()=>{
  const small=int(2,8),delta=int(1,6),large=small+delta,t=int(5,30),difference=delta*t
  return numeric(`The ratio of corresponding side lengths of two similar triangles is $${small}:${large}$. The larger triangle’s perimeter exceeds the smaller triangle’s perimeter by $${difference}$ units. What is the perimeter of the larger triangle?`,large*t,
   `Perimeters have the same ratio as corresponding sides. Write them as $${small}u$ and $${large}u$. Their difference is $${delta}u=${difference}$, so $u=${t}$ and the larger perimeter is $${large*t}$. Area ratios would use the square of the side ratio instead.`,v=>near(v-v*small/large,difference),[small*t,difference*large,large*t+difference])
 })
 f('regular-polygon-perimeter',G,'angles','hard',()=>{
  const n=pick([5,6,8,9,10,12,15,18,20,24]),side=int(3,35),angle=180-360/n
  return numeric(`Every interior angle of a regular polygon measures $${angle}^\\circ$, and each side has length $${side}$. What is its perimeter?`,n*side,
   `Each exterior turning angle is $180^\\circ-${angle}^\\circ=${360/n}^\\circ$. There are $360/(${360/n})=${n}$ sides. Thus the perimeter is $${n}(${side})=${n*side}$. The exterior angles sum to $360^\\circ$.`,v=>v>0&&near((v/side)*(180-angle),360),[n,side*(n-2),2*n*side])
 })
 f('annulus-outer-radius',G,'circles','medium',()=>{
  const inner=int(2,20),outer=int(inner+2,inner+20),area=outer*outer-inner*inner
  return numeric(`Two concentric circles have inner radius $${inner}$. The region inside the larger circle but outside the smaller circle has area $${area}\\pi$. What is the larger circle’s radius?`,outer,
   `The annulus area is $\\pi(R^2-${inner*inner})=${area}\\pi$. Divide by $\\pi$ and add $${inner*inner}$: $R^2=${outer*outer}$. A radius is positive, so $R=${outer}$. The area is a difference of squared radii.`,v=>v>inner&&near(v*v-inner*inner,area),[outer-inner,outer*outer,inner+outer])
 })
 f('sphere-inscribed-cube',G,'area','hard',()=>{
  const r=int(2,90),coefficient=4*r*r*r/3
  return numeric(`A sphere has volume $${frac(4*r*r*r,3)}\\pi$ cubic units. It is inscribed in a cube, touching all six faces. What is the length of an edge of the cube?`,2*r,
   `Use $V=${frac(4,3)}\\pi r^3$ to find $r^3=${r*r*r}$, so $r=${r}$. The cube’s edge equals the sphere’s diameter, $${2*r}$. The radius is half the edge.`,v=>v>0&&near(4/3*(v/2)**3,coefficient),[r,r*r,4*r])
 })
 f('equal-volume-cone-cylinder',G,'area','hard',()=>{
  const r=int(2,12),scale=int(2,5),h=int(3,25),coneHeight=3*h*scale*scale
  return numeric(`A cylinder has radius $${r*scale}$ and height $${h}$. A cone has radius $${r}$ and the same volume as the cylinder. What is the cone’s height?`,coneHeight,
   `Set $\\pi(${r*scale})^2(${h})=${frac(1,3)}\\pi(${r})^2H$. Cancel $\\pi$ and the squared cone radius to get $H=3(${scale})^2(${h})=${coneHeight}$. The cone’s one-third factor and the squared radius ratio both matter.`,v=>v>0&&near(r*r*v/3,(r*scale)**2*h),[h*scale*scale,3*h*scale,coneHeight/3])
 })
 f('sector-perimeter-radius',G,'circles','hard',()=>{
  const r=int(3,40),degrees=pick([30,45,60,90,120,150]),arcNumerator=r*degrees
  return numeric(`A circular sector has central angle $${degrees}^\\circ$ and perimeter $${2*r}+${frac(arcNumerator,180)}\\pi$ units, including its two radii. What is its radius?`,r,
   `The arc length is $${frac(degrees,180)}\\pi R$. Adding the two radii gives $P=2R+${frac(degrees,180)}\\pi R$. The stated perimeter equals this expression when $R=${r}$. Using arc length alone would omit the straight sides.`,v=>v>0&&near(2*v+degrees/180*Math.PI*v,2*r+arcNumerator/180*Math.PI),[2*r,arcNumerator/180,r+degrees/180])
 })
 f('cyclic-opposite-angle-parameter',G,'circles','hard',()=>{
  const a=int(2,7),c=int(2,7),x=int(3,10),b=int(5,30),d=180-(a+c)*x-b
  return numeric(`Quadrilateral $ABCD$ is inscribed in a circle. The measures of angles $A$ and $C$ are $(${a}x+${b})^\\circ$ and $(${c}x+${d})^\\circ$, respectively. What is $x$?`,x,
   `Opposite angles in a cyclic quadrilateral are supplementary. Thus $(${a}x+${b})+(${c}x+${d})=180$, giving $${a+c}x=${(a+c)*x}$ and $x=${x}$. The opposite angles sum to $180^\\circ$, not $360^\\circ$.`,v=>a*v+b>0&&c*v+d>0&&near(a*v+b+c*v+d,180),[x+1,2*x,(180-b-d)/a])
 })
}
