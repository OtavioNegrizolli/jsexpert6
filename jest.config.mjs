const defaultconfig = {
    coverageDirectory: "coverage",
    coverageProvider: "v8",
    coverageReporters: [
        "text",
        "lcov"
    ],
    coverageThreshold: {
        global: {
            branch: 100,
            function: 100,
            lines: 100,
            statements: 100
        }
    },
    maxWorkers: "50%",
    watchPathIgnorePatterns: [
        "node_modules"
    ],
    transformIgnorePatterns: [
        "node_modules"
    ]
}

export default {
    projects: [
        {
            ...defaultconfig,
            displayName: "backend",
            testEnvironment: "node",
            collectCoverageFrom: [
                "server/",
                "!server/index.js"
            ],
            transformIgnorePatterns: [
                ...defaultconfig.transformIgnorePatterns,
                "public"
            ],
            testMatch: [
                "**/tests/**/server/**.test.js"
            ]
        },
        {
            ...defaultconfig,
            displayName: "frontend",
            testEnvironment: "jsdom",
            collectCoverageFrom: [
                "public/",
            ],
            transformIgnorePatterns: [
                ...defaultconfig.transformIgnorePatterns,
                "server"
            ],
            testMatch: [
                "**/tests/**/public/**.test.js"
            ]
        },
    ]
}
