const axios = require('axios');



const initialUrl = 'https://api.staging.ehealth.id/fhir/Composition/?date=ge2024-04-01&date=le2024-04-30';

async function fetchAllCompositions(url) {
    let allEntries = [];
  
    try {
      let nextUrl = url;
  
      while (nextUrl) {
        const response = await axios.get(nextUrl);
        const data = response.data;
  
       
        if (data.entry && data.entry.length > 0) {
          allEntries = allEntries.concat(data.entry);
        }
  
       
        const nextLink = data.link.find(link => link.relation === "next");
        nextUrl = nextLink ? nextLink.url : null;
      }
    } catch (error) {
      console.error("Error fetching pages:", error);
    }
  
    return allEntries;
  }



async function countDiagnosis(req,res){
    



        const allCompositions = await fetchAllCompositions(initialUrl);
       

        
        

        const ArraySection= allCompositions.flatMap(entry=>entry.resource.section)
       
        const conditionReference=ArraySection.filter(comp=>comp.title == "Assessment/Diagnosis"  && comp.entry).flatMap(entry=>entry.entry)
      
        const conditionIds = conditionReference.map(entry => entry.reference);



        const conditionDetails = await Promise.all(
            conditionIds.map(async (conditionReference) => {
              const conditionUrl = `https://api.staging.ehealth.id/fhir/${conditionReference}`;
              const conditionResponse = await axios.get(conditionUrl);
              if (conditionResponse.data.code && conditionResponse.data.code.coding && conditionResponse.data.code.coding.length > 0) {
                
                const codeData = conditionResponse.data.code.coding[0];
                return { code: codeData.code, display: codeData.display };
              }
              return null
            })
          );
        
        
         const validConditionDetails = conditionDetails.filter(detail => detail !== null);
        
        
         const aggregatedConditions = validConditionDetails.reduce((acc, condition) => {
         const existing = acc.find(item => item.code === condition.code);
         if (existing) {
            existing.count += 1; 
         } else {
            acc.push({ ...condition, count: 1 });
         }
         return acc;
         }, []);
        
         if (res) {
            res.status(200).json({ conditionDetails: aggregatedConditions });
          }
}

module.exports = { countDiagnosis }