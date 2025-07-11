const isoCurrencies = ['USD','EUR','GBP','JPY','CAD','AUD'];
let customRules = [];

function normalize(h){
  return h.toLowerCase().replace(/\s+/g,'_');
}

function validateHeaders(headers){
  const required = ['invoice_number','date','amount','vendor','currency'];
  const normalized = headers.map(normalize);
  return required.filter(h=>!normalized.includes(h));
}

function validateRow(row){
  const errors = [];
  if(!row.invoice_number){
    errors.push({ field:'invoice_number', message:'Missing invoice_number' });
  }
  if(!row.date || isNaN(Date.parse(row.date))){
    errors.push({ field:'date', message:'Invalid date' });
  }
  if(row.currency && !isoCurrencies.includes(row.currency.toUpperCase())){
    errors.push({ field:'currency', message:'Misformatted currency' });
  }
  for(const rule of customRules){
    if(rule.type==='due_date_min' && row[rule.field]){
      const d=new Date(row[rule.field]);
      if(isNaN(d)){ errors.push({field:rule.field,message:'Invalid date'}); continue; }
      const min=new Date();
      min.setDate(min.getDate()+ (rule.days||0));
      if(d<min) errors.push({field:rule.field,message:rule.message});
    }
  }
  return errors;
}

function getValidationRules(){
  return customRules;
}

function addValidationRule(rule){
  customRules.push(rule);
}

module.exports = { validateHeaders, validateRow, getValidationRules, addValidationRule };
