"use strict";
function replayCommunication(plan) {
 const reality={...plan.objective_reality}, messages=[], beliefs={}, memories=[], relationships={}, history=[];
 for(const e of [...plan.entries].sort((a,b)=>a.at-b.at||a.id.localeCompare(b.id))){
  if(e.kind==="message"){const m={...e,actual_recipients:[],received_claim:e.corrupted??e.claim};messages.push(m);history.push({id:e.id,stage:"emission",at:e.at});if(e.status!=="failed"&&e.status!=="lost"){for(const r of e.recipients){m.actual_recipients.push(r);const trust=e.trust?.[r]??.5;beliefs[r]??=[];beliefs[r].push({message:e.id,claim:m.received_claim,confidence:Number((trust*e.fidelity).toFixed(3))});memories.push({agent:r,message:e.id});history.push({id:`deliver-${e.id}-${r}`,stage:e.intercept===r?"interception":"delivery",at:e.delivery_at??e.at});}} if(e.deception){relationships[e.speaker]??=0;relationships[e.speaker]-=.3;}}
  if(e.kind==="disclosure"){relationships[e.subject]=(relationships[e.subject]??0)-.4;history.push({id:e.id,stage:"disclosure",at:e.at});}
 }
 return {objective_reality:reality,messages,beliefs,memories,relationships,history};
}
module.exports={replayCommunication};
