const gcd=(a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b)[a,b]=[b,a%b];return a}
const coefficient=s=>s===''||s==='+'?1:s==='-'?-1:Number(s)
const term=(n,variable)=>n===0?'':`${n<0?'-':'+'}${Math.abs(n)===1&&variable?'':Math.abs(n)}${variable}`

// Only univariate, integer-coefficient quadratics equal to zero are handled.
// Matching the surrounding text preserves the requested target and conditions.
function quadraticCoefficients(math) {
 const equation=/^(.+)=0$/.exec(math)
 if(!equation)return null
 const body=equation[1].replace(/\\left|\\right/g,'').replace(/\^\{2\}/g,'^2')
 const linear=part=>{
  const match=/^([+-]?\d*)x([+-]\d+)?$/.exec(part)
  return match?[coefficient(match[1]),Number(match[2]??0)]:null
 }
 const product=/^([+-]?\d*)\(([^()]+)\)\(([^()]+)\)$/.exec(body)
 const square=/^([+-]?\d*)\(([^()]+)\)\^2$/.exec(body)
 let result
 if(product||square){
  const match=product??square,first=linear(match[2]),second=linear(product?match[3]:match[2])
  if(!first||!second)return null
  const scalar=coefficient(match[1]),[a,b]=first,[c,d]=second
  if(![scalar,a,b,c,d,a*c,a*d,b*c,b*d].every(Number.isSafeInteger))return null
  result=[scalar*a*c,scalar*(a*d+b*c),scalar*b*d]
 }else{
  const parts=body.match(/[+-]?[^+-]+/g)
  if(!parts||parts.join('')!==body)return null
  result=[0,0,0]
  for(const part of parts){
   const match=/^([+-]?)(\d*)(x(?:\^2)?)?$/.exec(part)
   if(!match||(!match[2]&&!match[3]))return null
   const value=(match[1]==='-'?-1:1)*Number(match[2]||1)
   if(!Number.isSafeInteger(value))return null
   const index=match[3]==='x^2'?0:match[3]==='x'?1:2
   result[index]+=value
   if(!Number.isSafeInteger(result[index]))return null
  }
 }
 return result[0]!==0&&result.every(Number.isSafeInteger)?result:null
}

/** Normalize whitespace and supported equivalent integer quadratic equations. */
export function questionFingerprint(q) {
 const text=`${q.passage??''}\n${q.prompt??''}`.normalize('NFC')
 return text.replace(/(?<!\\)\$((?:\\.|[^$\\])+?)\$/g,(_,raw)=>{
  const math=raw.replace(/[−–]/g,'-').replace(/\s+/g,'')
  const values=quadraticCoefficients(math)
  if(!values)return `$${math}$`
  const factor=values.reduce((a,b)=>gcd(a,b),0)*(values[0]<0?-1:1)
  const [a,b,c]=values.map(v=>v/factor)
  return `$${a===1?'':a}x^2${term(b,'x')}${term(c,'')}=0$`
 }).replace(/\s+/g,' ').trim()
}
