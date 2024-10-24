/**
 * Determines URL types and checks if the current URL indicates an admin or student page.
 * @param {string} url - The current request URL.
 * @returns {Object} - An object containing flags for admin URL, student URL, and record page.
 */

const getUrlFlags = (url) => {
    const isAdminURL = url.includes("admin");
    const isStudentURL = url.includes("student");
    const isEditURL = url.includes("edit");
    const isRecordPage = isAdminURL || isStudentURL;
    const isAdminPageURL = isAdminURL || isEditURL;

    return {
        isAdminURL,
        isStudentURL,
        isEditURL,
        isRecordPage,
        isAdminPageURL
    };
};

function isLeadingOrgs(organization) {
    const isSAO = organization === "SAO";
    const isUSG = organization === "USG";
    const isCSO = organization === "CSO";

    const isUSGorCSOorSAO = isUSG || isCSO || isSAO;

    return isUSGorCSOorSAO;
}

function isMainOrgs(organization, departmentName) {
    const isSAO = organization === "SAO";
    const isUSG = organization === "USG";
    const isCollege = departmentName === organization;
    const isCollegeDepartment = ["CAS", "CBA", "CCJE", "CCSEA", "CON", "CTE", "CTHM"].includes(organization);

    const isUSGorCollege = isUSG || isCollege;
    const isUSGorSAO = isUSG || isSAO;
    const isCollegeOrSAO = isCollege || isSAO;
    const isMainOrgsTrue = isUSG || isSAO || isCollege;
    const isUSGorCollegeOrSAO = isUSG || isCollegeDepartment || isSAO;

    return {
        isUSG,
        isSAO,
        isCollege,
        isCollegeDepartment,
        isUSGorCollege,
        isUSGorSAO,
        isCollegeOrSAO,
        isUSGorCollegeOrSAO,
        isMainOrgsTrue
    };
}

function isExtraOrgs(organization) {
    const ABO = [
        "JSWAP",
        "LABELS",
        "LSUPS",
        "POLISAYS",
        "JFINEX",
        "JMEX",
        "JPIA",
        "ALGES",
        "ICpEP",
        "IIEE",
        "JIECEP",
        "LISSA",
        "PICE",
        "SOURCE",
        "UAPSA",
        "ECC",
        "GENTLE",
        "GEM-O",
        "LapitBayan",
        "LME",
        "SPEM",
        "SSS",
        "FHARO",
        "FTL",
        "SOTE"
    ];
    const IBO = [
        "Compatriots",
        "Cosplay Corps",
        "Green Leaders",
        "Kainos",
        "Meeples",
        "Micromantics",
        "Red Cross Youth",
        "Soul Whisperers",
        "Vanguard E-sports"
    ];

    const isSAO = organization === "SAO";
    const isCSO = organization === "CSO";
    const isABO = ABO.includes(organization);
    const isIBO = IBO.includes(organization);

    const isABOorIBO = isABO || isIBO;
    const isCSOorABO = isCSO || isABO;
    const isCSOorIBO = isCSO || isIBO;
    const isCSOorSAO = isCSO || isSAO;
    const isABOorSAO = isABO || isSAO;
    const isIBOorSAO = isIBO || isSAO;
    const isCSOorABOorSAO = isCSO || isABO || isSAO;
    const isCSOorIBOorSAO = isCSO || isIBO || isSAO;
    const isExtraOrgsTrue = isSAO || isCSO || isABO || isIBO;

    return {
        ABO,
        IBO,
        isCSO,
        isABO,
        isIBO,
        isABOorIBO,
        isCSOorABO,
        isCSOorIBO,
        isCSOorSAO,
        isABOorSAO,
        isIBOorSAO,
        isCSOorABOorSAO,
        isCSOorIBOorSAO,
        isExtraOrgsTrue
    };
}

function otherCombinations(organization) {
    const isSAO = organization === "SAO";
    const isCollegeDepartment = ["CAS", "CBA", "CCJE", "CCSEA", "CON", "CTE", "CTHM"].includes(organization);
    const isCSO = organization === "CSO";

    const isCollegeOrCSOorSAO = isSAO || isCollegeDepartment || isCSO;

    return isCollegeOrCSOorSAO;
}

module.exports = { getUrlFlags, isLeadingOrgs, isMainOrgs, isExtraOrgs, otherCombinations };