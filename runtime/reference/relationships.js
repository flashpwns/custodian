"use strict";
function replayRelationships(plan) {
 const reality={...plan.objective_reality}, rel=new Map(), history=[];
 for(const e of [...plan.entries].sort((a,b)=>a.at-b.at||a.id.localeCompare(b.id))){const k=`${e.observer}|${e.subject}`;const r=rel.get(k)??{observer_id:e.observer,subject_id:e.subject,familiarity:0,trust:0,social_knowledge:[]}; if(e.kind==="contact")r.familiarity=1; if(e.kind==="cooperate"||e.kind==="betray")r.trust=Number((r.trust+e.delta).toFixed(6)); if(e.kind==="testimony")r.social_knowledge.push(`${e.claim}@${e.confidence}`);rel.set(k,r);history.push({id:e.id,kind:e.kind,at:e.at});}
 return {objective_reality:reality,relationships:[...rel.values()],history,reputation:[...rel.values()].reduce((n,r)=>n+r.trust,0)/rel.size};
}
module.exports={replayRelationships};
