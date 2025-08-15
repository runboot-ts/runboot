import { main } from "./main";

main()
    .then(() => {
        process.exit(0);
    })
    .catch((err: Error) => {
        console.error("Error:", err);
        process.exit(1);
    });
