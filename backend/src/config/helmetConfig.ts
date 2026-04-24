import helmet from "helmet";

export const getHelmetConfig = () => {
    const isDevelopment = process.env.NODE_ENV === "development";

    // Base configuration for APIs
    const baseConfig = {
        contentSecurityPolicy: false, // Disable for JSON APIs
        hidePoweredBy: true, // Always hide server info
        noSniff: true, // Always prevent MIME sniffing
    };

    if (isDevelopment) {
        return helmet({
            ...baseConfig,
            hsts: false, // No HTTPS enforcement in development
        });
    }

    // Production gets full security
    return helmet({
        ...baseConfig,
        hsts: {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true,
        },
        frameguard: { action: "deny" },
        referrerPolicy: { policy: "no-referrer" },
    });
};