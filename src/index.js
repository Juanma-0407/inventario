import app from "./app.js" ;
const main = ( )   => {
    app.listen(app.get("port")) ;
    console.log(`servidor corriendo brrrrrrrr uaaa ${app.get("port")}`) ;
}

main( ) ;