export const GENERIC_THEN = "A operação obteve êxito!";
export const GENERIC_CATCH = "A operação falhou.";

type EMessageType = "success" | "alert" | "error";

export const message = (type: EMessageType, message: string, details?: unknown) => {
    let signal;

    switch (type) {

    case "success":
        signal = "[✓] ";
        break;
	
    case "alert":
        signal = "[!] ";
        break;

    case "error":
        signal = "[✕] ";
        break;
    }

    console.log("\n" + signal + message);
	
    if (details) console.log(details);
};