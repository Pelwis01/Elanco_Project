
function CallAPI() {
 let result = fetch("https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&hourly=rain&models=ukmo_uk_deterministic_2km,ukmo_global_deterministic_10km&bounding_box=50,-5.5,50.25,-4.5https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&hourly=rain&models=ukmo_uk_deterministic_2km,ukmo_global_deterministic_10km&bounding_box=50,-5.5,50.25,-4.5").then(Response => Response.json()).then(object =>console.log(object))
 console.log(result)
}