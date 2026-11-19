// Additional numerical problem structures, registered after the first 152 families.
export function registerMathApplications({f,A,N,D,G,int,pick,numeric,near,fmt,term,frac}) {
 f('two-concentration-mixture',A,'system','hard',()=>{
  const p=int(1,4)*10,q=p+int(1,4)*10,a=int(10,80),b=int(10,80),total=a+b,solute=(p*a+q*b)/100
  return numeric(`Solution A is $${p}\\%$ concentrate by volume, and solution B is $${q}\\%$ concentrate by volume. A mixture containing only these solutions has volume $${total}$ liters and contains $${fmt(solute)}$ liters of concentrate. How many liters of solution A are in the mixture?`,a,
   `If A contributes $x$ liters, B contributes $${total}-x$. The concentrate equation is $${p/100}x+${q/100}(${total}-x)=${fmt(solute)}$. Solving gives $x=${a}$. The two concentrate percentages apply to their own solution volumes.`,v=>v>=0&&v<=total&&near(p*v/100+q*(total-v)/100,solute),[b,total,solute])
 })
 f('catch-up-converted-rate',A,'one','hard',()=>{
  const slow=int(25,70),gap=int(2,12),time=int(3,35),lead=gap*time,fast=slow+gap
  return numeric(`Two robots move in the same direction. Robot A travels at $${fast}$ meters per minute, and robot B travels at $${slow*60}$ meters per hour. At time zero, B is $${lead}$ meters ahead of A. How many minutes does A take to catch B?`,time,
   `Convert B’s rate to $${slow*60}/60=${slow}$ meters per minute. A closes the gap at $${fast}-${slow}=${gap}$ meters per minute. Therefore the catch-up time is $${lead}/${gap}=${time}$ minutes. Subtract rates only after using the same units.`,v=>v>=0&&near(fast*v,lead+slow*60*v/60),[lead/fast,lead/slow,time+1])
 })
 f('consecutive-even-middle',A,'one','medium',()=>{
  const t=int(2,95),middle=2*t+2,total=6*t+6
  return numeric(`The sum of three consecutive even integers is $${total}$. What is the middle integer?`,middle,
   `Write the integers as $m-2$, $m$, and $m+2$. Their sum is $3m=${total}$, so $m=${middle}$. Consecutive even integers differ by 2, and the equally spaced outer terms balance around the middle.`,v=>Number.isInteger(v)&&v%2===0&&near((v-2)+v+(v+2),total),[middle-2,middle+2,total/2])
 })
 f('inverse-linear-composition-parameter',A,'linear','hard',()=>{
  const a=int(2,15),b=int(-30,40)
  return numeric(`Let $f(x)=${a}x${term(b)}$ and $g(x)=${frac('x-k',a)}$. If $g(f(x))=x$ for every real $x$, what is $k$?`,b,
   `Substitute $f(x)$ into $g$: $g(f(x))=${frac(`${a}x${term(b)}-k`,a)}$. For this to equal $x$ for every input, the added constant must cancel, so $k=${b}$. The outer function reverses both operations in $f$.`,v=>[-5,0,8].every(x=>near((a*x+b-v)/a,x)),[-b,a,b+a])
 })
 f('intercept-ratio-through-point',A,'two','hard',()=>{
  const ratio=int(2,9),x=int(2,25),y=int(2,25),xint=x+ratio*y
  return numeric(`A line has positive axis intercepts and passes through $(${x},${y})$. Its $x$-intercept is $${ratio}$ times its $y$-intercept. What is its $x$-intercept?`,xint,
   `Let the $x$-intercept be $h$; the $y$-intercept is $h/${ratio}$. The intercept equation gives $x+${ratio}y=h$. Substituting the point yields $h=${x}+${ratio}(${y})=${xint}$.`,v=>v>0&&near(x/v+y/(v/ratio),1),[x+y,x+ y/ratio,ratio*(x+y)])
 })
 f('symmetric-linear-output-sum',A,'linear','medium',()=>{
  const h=int(-20,20),d=int(2,18),value=int(-30,65)
  return numeric(`The function $f$ is linear, and $f(${h})=${value}$. What is $f(${h-d})+f(${h+d})$?`,2*value,
   `For a linear function, equally spaced inputs have equally spaced outputs. The two inputs are $${d}$ units on opposite sides of $${h}$, so their outputs sum to $2f(${h})=2(${value})=${2*value}$. The slope contributions cancel.`,v=>[-3,2,7].every(m=>near(v,(value-m*d)+(value+m*d))),[value,2*value+d,2*value-d])
 })
 f('feasible-integer-coordinate-bound',A,'inequality','hard',()=>{
  const a=int(2,12),b=int(2,10),minimumY=int(2,20),maximumX=int(3,35),c=a*maximumX+b*minimumY+int(0,a-1)
  return numeric(`The nonnegative integers $x$ and $y$ satisfy $${a}x+${b}y\\le ${c}$ and $y\\ge ${minimumY}$. What is the greatest possible value of $x$?`,maximumX,
   `The smallest permitted $y$, namely $${minimumY}$, leaves the most room for $x$. Then $${a}x\\le ${c-b*minimumY}$, so the greatest integer $x$ is $${maximumX}$. Increasing $y$ would reduce the available amount.`,v=>Number.isInteger(v)&&v>=0&&a*v+b*minimumY<=c&&a*(v+1)+b*minimumY>c,[maximumX+1,Math.floor(c/a),c-b*minimumY])
 })
 f('system-solution-on-diagonal',A,'system','medium',()=>{
  const a=int(2,10),b=int(2,10),t=int(2,25),m=int(2,12),k=int(2,18),c=(a+b)*t,d=(m+k)*t
  return numeric(`The system $${a}x+${b}y=${c}$ and $${m}x+ky=${d}$ has a solution for which $x=y$. What is $k$?`,k,
   `Set $x=y=t$ in the first equation to obtain $${a+b}t=${c}$, so $t=${t}$. Substitute into the second: $${m*t}+${t}k=${d}$. Thus $k=${k}$. The diagonal condition supplies both coordinates.`,v=>{const point=c/(a+b);return near(m*point+v*point,d)},[d-m*t,m+k,b])
 })

 f('shared-smaller-root-parameter',N,'nonlinear','hard',()=>{
  const r=int(2,15),s=int(r+2,r+18),t=int(s+1,s+16),k=-(r+t)
  return numeric(`The smaller solution of $x^2-${r+s}x+${r*s}=0$ is also a solution of $x^2+kx+${r*t}=0$. What is $k$?`,k,
   `Factor the first equation as $(x-${r})(x-${s})=0$. Its smaller root is $${r}$. Substituting gives $${r*r}+${r}k+${r*t}=0$, so $k=-${r+t}$. The shared root is specified; using the larger first root would solve a different condition.`,v=>near(r*r+v*r+r*t,0)&&r<s,[-(r+s),r+t,-r*t])
 })
 f('absolute-distance-outer-solution',N,'nonlinear','hard',()=>{
  const left=int(-15,5),gap=int(3,20),right=left+gap,extra=int(2,18),distance=gap+2*extra,answer=right+extra
  return numeric(`The equation $|x${term(-left)}|+|x${term(-right)}|=${distance}$ has two real solutions. What is the greater solution?`,answer,
   `Between $${left}$ and $${right}$, the sum of distances is only $${gap}$. The greater solution must lie to the right of $${right}$, where $2x-(${left}+${right})=${distance}$. Solving gives $x=${answer}$.`,v=>v>=right&&near(Math.abs(v-left)+Math.abs(v-right),distance),[left-extra,right,answer+extra])
 })
 f('exponential-base-rewrite-equation',N,'nonlinear','hard',()=>{
  const base=int(2,7),answer=int(2,18),h=2*int(1,12)+answer%2,k=(3*answer+h)/2
  return numeric(`What value of $x$ satisfies $${base}^{x+${h}}=${base*base}^{${k}-x}$?`,answer,
   `Since $${base*base}=${base}^2$, the right side is $${base}^{${2*k}-2x}$. Equal powers of the same positive base other than 1 have equal exponents: $x+${h}=${2*k}-2x$. Thus $3x=${2*k-h}$ and $x=${answer}$.`,v=>near(v+h,2*(k-v)),[k-h,(2*k+h)/3,k+h])
 })
 f('negative-branch-radical-identity',N,'equivalent','hard',()=>{
  const a=int(2,18),b=int(2,30)
  return numeric(`For every $x<-${frac(b,a)}$, $\\sqrt{${a*a}x^2+${2*a*b}x+${b*b}}=cx+d$. What is $c$?`,-a,
   `The radicand is $(${a}x+${b})^2$, whose square root is $|${a}x+${b}|$. On the stated domain, $${a}x+${b}<0$, so this equals $-${a}x-${b}$. Therefore $c=-${a}$. A square root returns a nonnegative value, requiring the sign reversal.`,v=>[-b/a-1,-b/a-3,-b/a-7].every(x=>near(Math.sqrt(a*a*x*x+2*a*b*x+b*b),v*x-b)),[a,b,-b])
 })
 f('repeated-root-cubic-coefficient',N,'equivalent','hard',()=>{
  const a=int(2,9),r=int(-15,15),s=int(2,22),coefficient=a*(r*r+2*r*s)
  return numeric(`When $${a}(x${term(-r)})^2(x-${s})$ is expanded, what is the coefficient of $x$?`,coefficient,
   `First square the repeated factor: $x^2${term(-2*r)}x+${r*r}$. The linear terms after multiplication by $(x-${s})$ contribute $${2*r*s}+${r*r}=${r*r+2*r*s}$. Multiply by $${a}$ to get $${coefficient}$.`,v=>[-2,1,4].every(x=>near(a*(x-r)**2*(x-s),a*x**3-a*(2*r+s)*x*x+v*x-a*r*r*s)),[a*r*r,2*a*r*s,-coefficient])
 })
 f('reflected-quadratic-minimum',N,'function','hard',()=>{
  const a=int(2,10),h=int(-15,15),maximum=int(5,35),scale=int(2,9),offset=int(2,40),answer=offset-scale*maximum
  return numeric(`Let $f(x)=-${a}(x${term(-h)})^2+${maximum}$ and $g(x)=${offset}-${scale}f(x)$. What is the minimum value of $g$?`,answer,
   `Substitution gives $g(x)=${scale*a}(x${term(-h)})^2${term(answer)}$. Its squared term is nonnegative, so the minimum is $${answer}$ at $x=${h}$. Multiplication by a negative number changes the maximum of $f$ into a minimum of $g$.`,v=>{const g=x=>offset-scale*(-a*(x-h)**2+maximum);return near(v,g(h))&&[h-3,h+2].every(x=>g(x)>v)},[maximum,offset+scale*maximum,h])
 })
 f('two-denominator-rational-equation',N,'nonlinear','hard',()=>{
  const b=int(2,15),h=int(-20,20),step=int(2,18),k=h+step,answer=h+2*step
  return numeric(`For $x\\ne ${h}$ and $x\\ne ${k}$, what value of $x$ satisfies $${frac(2*b,`x${term(-h)}`)}=${frac(b,`x${term(-k)}`)}$?`,answer,
   `Cross multiply: $${2*b}(x${term(-k)})=${b}(x${term(-h)})$. Divide by $${b}$ and solve $2x-${2*k}=x${term(-h)}$, giving $x=${answer}$. This differs from both excluded values.`,v=>!near(v,h)&&!near(v,k)&&near(2*b/(v-h),b/(v-k)),[h,k,2*h-k])
 })
 f('parabola-line-intersection-count',N,'nonlinear','medium',()=>{
  const h=int(-15,15),k=int(-25,25),m=2*int(1,10),kind=int(-1,1),delta=kind*int(1,15),b=k-m*h-m*m/4+delta
  return numeric(`How many distinct real intersection points do the graphs $y=(x${term(-h)})^2${term(k)}$ and $y=${m}x${term(b)}$ have?`,kind<0?0:kind===0?1:2,
   `Equating the two formulas yields a quadratic with discriminant $${4*delta}$. A negative discriminant gives no real intersections, zero gives one, and a positive discriminant gives two. Here the graphs have $${kind<0?0:kind===0?1:2}$ distinct real intersection${kind===0?'':'s'}.`,v=>{const disc=(-2*h-m)**2-4*(h*h+k-b);return near(v,disc<0?0:disc===0?1:2)},[0,1,2,3])
 })

 f('same-color-with-replacement',D,'probability','hard',()=>{
  const units=int(2,20),redUnits=int(1,19),red=redUnits*units,total=20*units,blue=total-red,p=red/total,answer=p*p+(1-p)**2
  return numeric(`A bag contains $${red}$ red counters and $${blue}$ blue counters. A counter is selected at random, its color is recorded, and it is returned before a second random selection. What is the probability that the two selected counters have the same color?`,answer,
   `Replacement keeps each color probability unchanged. Matching colors means two reds or two blues, so add $(${frac(red,total)})^2+(${frac(blue,total)})^2=${frac(red*red+blue*blue,total*total)}$. Counting only the red-red outcome omits another way to match.`,v=>near(v,(red*red+blue*blue)/(total*total)),[p*p,2*p*(1-p),p])
 })
 f('equal-distance-average-speed',D,'ratio','hard',()=>{
  const a=int(2,6),b=int(1,a-1),scale=int(2,7),v1=a*(a+b)*scale,v2=b*(a+b)*scale,distance=int(2,25)*100,answer=2*a*b*scale
  return numeric(`A vehicle travels two segments of equal length. Its speed is $${v1}$ meters per minute on the first segment and $${v2}$ meters per minute on the second. What is its average speed, in meters per minute, for the entire journey?`,answer,
   `Average speed is total distance divided by total time. If each segment has length $d$, the result is $${frac('2d',`d/${v1}+d/${v2}`)}=${frac(2*v1*v2,v1+v2)}=${answer}$. The slower segment takes more time, so the arithmetic average of the speeds is inappropriate.`,v=>near(v*(distance/v1+distance/v2),2*distance),[(v1+v2)/2,v1+v2,v1-v2])
 })
 f('changing-share-and-population',D,'percent','hard',()=>{
  const base=int(4,20)*100,initialShare=int(2,4)*10,drop=pick([20,40]),laterShare=initialShare+int(1,3)*10,later=base*(100-drop)/100,answer=later*laterShare/100-base*initialShare/100
  return numeric(`A club initially has $${base}$ members, of whom $${initialShare}\\%$ use its workshop. The club’s total membership later decreases by $${drop}\\%$, and $${laterShare}\\%$ of the remaining members use the workshop. What is the later number of workshop users minus the initial number?`,answer,
   `The initial count is $${base}(${initialShare/100})=${base*initialShare/100}$. Later membership is $${later}$, so later workshop use is $${later}(${laterShare/100})=${later*laterShare/100}$. Subtract to obtain $${answer}$. A larger share need not mean a larger count.`,v=>near(v+base*initialShare/100,base*(1-drop/100)*laterShare/100),[laterShare-initialShare,base*(laterShare-initialShare)/100,-answer])
 })
 f('negative-affine-standard-deviation',D,'data','medium',()=>{
  const original=int(2,18),scale=int(2,12),shift=int(5,80)
  return numeric(`Data set A has standard deviation $${original}$. Data set B is formed by replacing each value $x$ in A with $${shift}-${scale}x$. What is the standard deviation of B?`,scale*original,
   `Multiplication by $-${scale}$ multiplies distances from the mean by $${scale}$, and adding $${shift}$ does not change those distances. The new standard deviation is $${scale}(${original})=${scale*original}$. Standard deviation cannot be negative.`,v=>v>=0&&near(v*v,scale*scale*original*original),[-scale*original,original+shift,scale*scale*original])
 })
 f('observed-value-from-model-residual',D,'model','medium',()=>{
  const m=int(2,15),b=int(5,45),x=int(3,25),residual=pick([-1,1])*int(2,15),observed=m*x+b+residual
  return numeric(`A model predicts $y=${m}x+${b}$. At $x=${x}$, the residual, defined as observed minus predicted, is $${residual}$. What is the observed value of $y$?`,observed,
   `The prediction is $${m}(${x})+${b}=${m*x+b}$. Since residual equals observed minus predicted, observed equals predicted plus residual: $${m*x+b}${term(residual)}=${observed}$. Reversing that addition reverses the residual’s meaning.`,v=>near(v-(m*x+b),residual),[m*x+b-residual,m*x+b,residual])
 })
 f('stratified-population-count-estimate',D,'inference','hard',()=>{
  const a=int(3,15)*100,b=int(5,25)*100,p=int(2,8)*10,q=int(2,8)*10,answer=(a*p+b*q)/100
  return numeric(`A district has $${a}$ students in group A and $${b}$ in group B. Separate random samples estimate that $${p}\\%$ of A and $${q}\\%$ of B use school transport. Using those estimates, how many district students use school transport?`,answer,
   `Estimate each group’s count separately: $${a}(${p/100})=${a*p/100}$ and $${b}(${q/100})=${b*q/100}$. Add the estimated counts to get $${answer}$. Averaging percentages without group sizes can give the wrong district estimate.`,v=>near(v,a*p/100+b*q/100),[(a+b)*(p+q)/200,p+q,answer+a])
 })
 f('minimum-sample-for-margin',D,'inference','hard',()=>{
  const base=int(2,20)*25,margin=int(2,8),factor=int(2,5),target=margin/factor,answer=base*factor*factor
  return numeric(`Under a survey model, margin of error is inversely proportional to the square root of sample size. A sample of $${base}$ has margin $${margin}$ percentage points. What is the least sample size that makes the modeled margin at most $${frac(margin,factor)}$ percentage points?`,answer,
   `The target margin is $1/${factor}$ of the original, so sample size must be at least $${factor}^2=${factor*factor}$ times as large. This gives $${base}(${factor*factor})=${answer}$. The square-root relationship requires squaring the reduction factor.`,v=>Number.isInteger(v)&&v>0&&margin*Math.sqrt(base/v)<=target+1e-10&&(v===1||margin*Math.sqrt(base/(v-1))>target),[base*factor,base/factor,answer+base])
 })
 f('map-area-scale-conversion',D,'ratio','hard',()=>{
  const scale=int(2,18),area=int(3,45),answer=area*scale*scale
  return numeric(`On a map, $1$ centimeter represents $${scale}$ meters. A region has area $${area}$ square centimeters on the map. What is the actual area of the region, in square meters?`,answer,
   `Every length is scaled by $${scale}$, so area is scaled by $${scale}^2=${scale*scale}$. The actual area is $${area}(${scale*scale})=${answer}$ square meters. A linear scale must be squared when converting area.`,v=>near(v/(scale*scale),area),[area*scale,area/scale,area+scale*scale])
 })

 f('rectangle-in-circle-perimeter',G,'circles','hard',()=>{
  const [a,b,c]=pick([[3,4,5],[5,12,13],[8,15,17]]),t=int(2,30)
  return numeric(`A rectangle is inscribed in a circle of radius $${c*t}$. The ratio of its shorter side to its longer side is $${a}:${b}$. What is the rectangle’s perimeter?`,4*(a+b)*t,
   `The rectangle’s diagonal equals the circle’s diameter, $${2*c*t}$. A right triangle with leg ratio $${a}:${b}$ has hypotenuse ratio $${c}$. Thus the rectangle’s sides are $${2*a*t}$ and $${2*b*t}$, giving perimeter $${4*(a+b)*t}$.`,v=>{const unit=v/(2*(a+b));return unit>0&&near(Math.hypot(a*unit,b*unit),2*c*t)},[2*(a+b)*t,2*c*t,4*a*b*t])
 })
 f('inscribed-square-from-circle-area',G,'area','hard',()=>{
  const r=int(2,95)
  return numeric(`A square is inscribed in a circle with area $${r*r}\\pi$. What is the square’s area?`,2*r*r,
   `The circle’s radius is $${r}$, so the square’s diagonal is $${2*r}$. For a square of side $s$, $2s^2=(${2*r})^2$. Therefore the square’s area $s^2$ is $${2*r*r}$. The diagonal, not the side, is the diameter.`,v=>v>0&&near(2*v,4*r*r),[r*r,4*r*r,2*r])
 })
 f('right-triangle-area-from-tangent',G,'trig','hard',()=>{
  const [a,b,c]=pick([[3,4,5],[5,12,13],[8,15,17]]),t=int(2,30)
  return numeric(`In a right triangle, the tangent of acute angle $A$ is $${frac(a,b)}$, and the hypotenuse has length $${c*t}$. What is the triangle’s area?`,a*b*t*t/2,
   `Tangent gives the opposite-to-adjacent leg ratio $${a}:${b}$. With hypotenuse ratio $${c}$, the scale factor is $${t}$, so the legs are $${a*t}$ and $${b*t}$. Area is $${frac(1,2)}(${a*t})(${b*t})=${fmt(a*b*t*t/2)}$.`,v=>{const unit=c*t/Math.hypot(a,b);return v>0&&near(v,a*b*unit*unit/2)},[a*b*t*t,a*b*t/2,c*c*t*t/2])
 })
 f('same-side-interior-angle-parameter',G,'angles','medium',()=>{
  const a=int(2,7),b=int(2,7),x=int(3,10),constant=int(5,25),other=180-(a+b)*x-constant
  return numeric(`Two parallel lines are cut by a transversal. A pair of same-side interior angles measures $(${a}x+${constant})^\\circ$ and $(${b}x+${other})^\\circ$. What is $x$?`,x,
   `Same-side interior angles formed by parallel lines are supplementary. Add the expressions and set the sum equal to $180$: $${a+b}x+${constant+other}=180$. Solving gives $x=${x}$. These angles are not generally equal.`,v=>a*v+constant>0&&b*v+other>0&&near(a*v+constant+b*v+other,180),[2*x,x+1,(other-constant)/(a-b||1)])
 })
 f('similar-cone-cut-volume',G,'area','hard',()=>{
  const ratio=int(2,5),unit=int(2,35),height=int(2,15),volume=ratio**3*unit,answer=volume-unit
  return numeric(`A cone has height $${ratio*height}$ and volume $${volume}$. A plane parallel to its base cuts off a smaller cone at the vertex with height $${height}$. What is the volume of the remaining solid?`,answer,
   `The smaller cone is similar to the original with length scale $1/${ratio}$. Its volume scale is $1/${ratio**3}$, so its volume is $${volume}/${ratio**3}=${unit}$. Subtract to get $${volume}-${unit}=${answer}$. Volume scales cubically, not linearly.`,v=>v>0&&near(volume-v,volume*(height/(ratio*height))**3),[volume-volume/ratio,unit,volume-volume/(ratio*ratio)])
 })
 f('cylinder-radius-two-measures',G,'area','hard',()=>{
  const r=int(2,25),h=int(2,30),lateral=2*r*h,volume=r*r*h
  return numeric(`A right circular cylinder has volume $${volume}\\pi$ and lateral surface area $${lateral}\\pi$, excluding its two bases. What is its radius?`,r,
   `Use $V=\\pi r^2h$ and $L=2\\pi rh$. Their ratio is $V/L=r/2$, so $r=2(${volume})/${lateral}=${r}$. Including the bases in the surface-area formula would change this relationship.`,v=>{if(v<=0)return false;const height=lateral/(2*v);return near(v*v*height,volume)},[h,volume/lateral,lateral/volume])
 })
 f('nested-similar-triangle-side',G,'angles','medium',()=>{
  const t=int(2,15),u=int(2,12),scale=int(2,12),heightScale=int(2,15),ad=t*scale,db=u*scale,de=t*heightScale,answer=(t+u)*heightScale
  return numeric(`In triangle $ABC$, point $D$ lies on side $AB$ and point $E$ lies on side $AC$, with $DE$ parallel to $BC$. If $AD=${ad}$, $DB=${db}$, and $DE=${de}$, what is $BC$?`,answer,
   `Parallel segments make triangles $ADE$ and $ABC$ similar. The full side $AB=${ad}+${db}=${ad+db}$. Thus $${frac(de,'BC')}=${frac(ad,ad+db)}$, so $BC=${answer}$. The larger side is the sum $AD+DB$, not just $DB$.`,v=>v>0&&near(de/v,ad/(ad+db)),[de*db/ad,de+db,answer+heightScale])
 })
 f('two-tangents-minor-arc',G,'circles','medium',()=>{
  const angle=int(20,145)
  return numeric(`Tangents from point $P$ touch a circle at $A$ and $B$. If $\\angle APB=${angle}^\\circ$, what is the degree measure of minor arc $AB$?`,180-angle,
   `Each tangent is perpendicular to its radius. In quadrilateral $OAPB$, where $O$ is the center, the two right angles leave $\\angle AOB+\\angle APB=180^\\circ$. The minor arc has measure $\\angle AOB=180-${angle}=${180-angle}^\\circ$.`,v=>v>0&&v<180&&near(v+angle+90+90,360),[angle,2*angle,360-angle])
 })
}
