import app from "./app.js";

const main = () => {
    const port = app.get("port") || 5000;
    const host = "127.0.0.1"; // bind explicitly to IPv4 loopback for predictable behavior

    const server = app.listen(port, host, () => {
        console.log(`servidor corriendo en http://${host}:${port}`);
    });

    server.on("error", (err) => {
        console.error("Error al iniciar el servidor:", err);
        process.exit(1);
    });
};

main();