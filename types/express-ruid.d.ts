declare function _exports({ setHeader, header, attribute, setInContext, prefixRoot, prefixSeparator, upBytes, idSeparator, idMax, }?: {
    setHeader?: boolean;
    header?: string;
    attribute?: string;
    setInContext?: boolean;
    prefixRoot?: string;
    prefixSeparator?: string;
    upBytes?: number;
    idSeparator?: string;
    idMax?: number;
}): (req: any, res: any, next: any) => void;
export = _exports;
