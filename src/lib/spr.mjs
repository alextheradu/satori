/** Digital SAT typed-response syntax and permitted decimal representations. */
export function parseSprNumber(raw) {
 const value=String(raw).trim().replace(/−/g,'-')
 if(!/^-?(?:\d+(?:\.\d*)?|\.\d+|\d+\/\d+)$/.test(value))return null
 const parts=value.split('/'),number=parts.length===2?Number(parts[0])/Number(parts[1]):Number(value)
 return Number.isFinite(number)?number:null
}

export function isSprEntry(raw) {
 const value=String(raw).trim().replace(/−/g,'-')
 return value.length<=(value.startsWith('-')?6:5)&&parseSprNumber(value)!==null
}

export function sanitizeSprInput(raw) {
 const value=String(raw).replace(/−/g,'-').replace(/[^0-9./-]/g,'')
 return value.slice(0,value.startsWith('-')?6:5)
}

/** Exact short fractions/decimals plus the permitted truncated and rounded decimals. */
export function sprEntries(answer) {
 const target=parseSprNumber(answer)
 if(target===null)return []
 const entries=[]
 const add=value=>{if(isSprEntry(value)&&!entries.includes(value))entries.push(value)}
 add(String(answer).trim().replace(/−/g,'-'))
 const magnitude=Math.abs(target),sign=target<0?'-':''
 const compact=number=>`${sign}${number}`.replace(/^(-?)0\./,'$1.')
 const exact=String(magnitude)
 if(!exact.includes('e'))add(compact(exact))
 if(!Number.isInteger(target)) {
  // Four numerical digits, including a leading zero when it is retained.
  // Omitting that zero permits one additional decimal place below 1.
  const integerDigits=magnitude<1?1:Math.floor(Math.log10(magnitude))+1
  const precisions=new Set(magnitude<1?[4,3]:[Math.max(0,4-integerDigits)])
  for(const places of precisions) {
   const factor=10**places,scaled=magnitude*factor
   const tolerance=Number.EPSILON*Math.max(1,scaled)*8
   for(const n of [Math.trunc(scaled+tolerance)/factor,Math.round(scaled)/factor]) {
    add(compact(Number(n.toFixed(places))))
   }
  }
 }
 return entries
}

export function matchesSprAnswer(answer,input) {
 if(!isSprEntry(input))return false
 const value=parseSprNumber(input)
 return sprEntries(answer).some(entry=>{
  const candidate=parseSprNumber(entry)
  return Math.abs(value-candidate)<=1e-10*Math.max(1,Math.abs(candidate))
 })
}
