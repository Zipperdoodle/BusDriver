
namespace Fetch {

    export type FetchResult<T> = {
        mData?: T;
        mResponseOk: boolean;
        mResponseStatus: number;
        mErrorMessage?: string;
    };



    export type QueryParams = {
        [key: string]: string | number | boolean;
    };



    export function UrlQueryString(aApiEndpoint: string, aQueryParams?: QueryParams): string {
        const lUrl = new URL(aApiEndpoint);

        if (aQueryParams) {
            Object.keys(aQueryParams).forEach(aKey => {
                const lValue = aQueryParams[aKey];
                if (lValue !== undefined) {
                    lUrl.searchParams.append(encodeURIComponent(aKey), encodeURIComponent(lValue.toString()));
                }
            });
        }

        return lUrl.toString();
    };



    export async function FetchedData<T>(aApiEndpoint: string, aHeaders: Record<string, string>, aQueryParams?: QueryParams): Promise<FetchResult<T>> {
        try {
            const lUrlQueryString = UrlQueryString(aApiEndpoint, aQueryParams);
            const lHeaders = { 'Content-Type': 'application/json', ...aHeaders };
            const lResponse = await fetch(lUrlQueryString, { method: 'GET', headers: lHeaders });
            const lData = await lResponse.json();
            return { mData: lData, mResponseOk: lResponse.ok, mResponseStatus: lResponse.status, mErrorMessage: `Received status code ${lResponse.status}` };
        } catch (aError) {
            return { mResponseOk: false, mResponseStatus: -1, mErrorMessage: (aError as Error).message };
        }
    };
};



namespace TransitLandAPIClient {

    export type TLAPIClient = Record<string, Function>; //!@#TODO...
    export type GenericRecord = Record<string, string | number | boolean | object>; //!@#HACK
    export type Operator = GenericRecord; //!@#TODO...
    export type Route = GenericRecord; //!@#TODO...
    export type Trip = GenericRecord; //!@#TODO...
    export type Stop = GenericRecord; //!@#TODO...
    export type Departure = GenericRecord; //!@#TODO...

    type TransitLandArrayKey = "operators" | "routes" | "trips" | "stops" | "departures";

    export interface TransitLandData {
        meta?: {
            after?: number;
            next?: string;
        };
        operators?: Operator[];
        routes?: Route[];
        trips?: Trip[];
        stops?: Stop[];
        departures?: Departure[];
    };



    export const cDefaultAPIBase = "https://transit.land/api/v2/rest";



    async function FetchedTransitLandDataPage(aApiKey: string, aApiEndpoint: string, aQueryParams?: Fetch.QueryParams): Promise<Fetch.FetchResult<TransitLandData>> {
        const lHeaders = { 'Content-Type': 'application/json', 'apikey': aApiKey };
        const lResponse = await Fetch.FetchedData<TransitLandData>(aApiEndpoint, lHeaders, aQueryParams);
        // lResponse.mData = lResponse.mData || {};
        return lResponse;
    };



    async function FetchedTransitLandData(aArrayKey: TransitLandArrayKey, aApiKey: string, aApiEndpoint: string, aQueryParams?: Fetch.QueryParams): Promise<Fetch.FetchResult<TransitLandData>> {
        const lData: TransitLandData = {};
        let lResponse: Fetch.FetchResult<TransitLandData> | null = null;
        let lLinkToNextSet: string | undefined = aApiEndpoint;

        do {
            lResponse = await FetchedTransitLandDataPage(aApiKey, lLinkToNextSet, aQueryParams);
            lData[aArrayKey] = [...(lData[aArrayKey] || []), ...(lResponse.mData?.[aArrayKey] || [])]
            lLinkToNextSet = lResponse.mData?.meta?.next;
            aQueryParams = undefined;
        } while (lLinkToNextSet);

        if (lResponse.mData) {
            lResponse.mData[aArrayKey] = lData[aArrayKey];
        }

        return lResponse;
    };



    export function Client(aApiKey: string, aApiBase?: string): TLAPIClient {
        const lApiBase = aApiBase || cDefaultAPIBase;
        return {
            FetchedOperators: async (aQueryParams: Fetch.QueryParams): Promise<Fetch.FetchResult<TransitLandData>> => {
                const lApiEndpoint = `${lApiBase}/operators`;
                return await FetchedTransitLandData("operators", aApiKey, lApiEndpoint, aQueryParams);
            },
            FetchedOperator: async (aOperatorID: string): Promise<Fetch.FetchResult<TransitLandData>> => {
                const lApiEndpoint = `${lApiBase}/operators/${aOperatorID}`;
                return await FetchedTransitLandData("operators", aApiKey, lApiEndpoint);
            },
            FetchedRoutes: async (aOperatorID: string, aQueryParams?: Fetch.QueryParams): Promise<Fetch.FetchResult<TransitLandData>> => {
                const lApiEndpoint = `${lApiBase}/routes`;
                return await FetchedTransitLandData("routes", aApiKey, lApiEndpoint, { operator_onestop_id: aOperatorID, ...aQueryParams });
            },
            FetchedRoute: async (aRouteID: string, aQueryParams?: Fetch.QueryParams): Promise<Fetch.FetchResult<TransitLandData>> => {
                const lApiEndpoint = `${lApiBase}/routes/${aRouteID}`;
                return await FetchedTransitLandData("routes", aApiKey, lApiEndpoint, aQueryParams);
            },
            FetchedTrips: async (aRouteID: string, aQueryParams?: Fetch.QueryParams): Promise<Fetch.FetchResult<TransitLandData>> => {
                const lApiEndpoint = `${lApiBase}/routes/${aRouteID}/trips`;
                return await FetchedTransitLandData("trips", aApiKey, lApiEndpoint, aQueryParams);
            },
            FetchedTrip: async (aRouteID: string, aTripID: string): Promise<Fetch.FetchResult<TransitLandData>> => {
                const lApiEndpoint = `${lApiBase}/routes/${aRouteID}/trips/${aTripID}`;
                return await FetchedTransitLandData("trips", aApiKey, lApiEndpoint);
            },
            FetchedStops: async (aQueryParams: Fetch.QueryParams): Promise<Fetch.FetchResult<TransitLandData>> => {
                const lApiEndpoint = `${lApiBase}/stops`;
                return await FetchedTransitLandData("stops", aApiKey, lApiEndpoint, aQueryParams);
            },
            FetchedStop: async (aStopID: string): Promise<Fetch.FetchResult<TransitLandData>> => {
                const lApiEndpoint = `${lApiBase}/stops/${aStopID}`;
                return await FetchedTransitLandData("stops", aApiKey, lApiEndpoint);
            },
            FetchedDepartures: async (aStopID: string): Promise<Fetch.FetchResult<TransitLandData>> => {
                const lApiEndpoint = `${lApiBase}/stops/${aStopID}/departures`;
                return await FetchedTransitLandData("departures", aApiKey, lApiEndpoint);
            },
        };
    };
};



namespace UI {

    export function ShowPanel(aPanelID: string) {
        const lPanel = document.getElementById(aPanelID);
        if (lPanel) {
            lPanel.style.display = 'block';
        }
    };



    export function HidePanel(aPanelID: string) {
        const lPanel = document.getElementById(aPanelID);
        if (lPanel) {
            lPanel.style.display = 'none';
        }
    };



    export function PopulateTable(aTableId: string, aData: Record<string, string | number>[], aHeaders: string[]): void {
        const lTable = document.getElementById(aTableId) as HTMLTableElement;

        if (lTable) {
            //!@#TODO: Runtime check that lTable is indeed a table element

            lTable.innerHTML = '';  // Clear existing table data

            // Create table header
            const lTableHead = lTable.createTHead();
            const lHeaderRow = lTableHead.insertRow();
            aHeaders.forEach(aHeader => {
                const lHeaderCell = document.createElement('th');
                lHeaderCell.textContent = aHeader;
                lHeaderRow.appendChild(lHeaderCell);
            });

            // Create table body
            const lTableBody = lTable.createTBody();
            aData.forEach(rowData => {
                const lDataRow = lTableBody.insertRow();
                aHeaders.forEach(header => {
                    const lDataCell = lDataRow.insertCell();
                    lDataCell.textContent = rowData[header].toString();
                });
            });
        }
    }
};



namespace SettingsUI {

    export const cUserSettings: Record<string, string> = {
        TransitLandAPIKey: '',
        OperatorID: '',
        BusStopDelaySeconds: '30',
    };



    export function LoadSettingsFromStorage(): void {
        const lStoredSettings = localStorage.getItem('UserSettings');
        if (lStoredSettings) {
            Object.assign(cUserSettings, JSON.parse(lStoredSettings));
        }
    };



    export function PopulateSettingsTable(): void {
        const lSettingsTable = document.getElementById('SettingsTable') as HTMLTableElement;
        lSettingsTable.innerHTML = '';

        Object.entries(cUserSettings).forEach(([aKey, aValue]) => {
            const lRow = lSettingsTable.insertRow();
            lRow.insertCell().textContent = aKey;
            const lValueCell = lRow.insertCell();
            const lInput = document.createElement('input');
            lInput.value = aValue;
            lValueCell.appendChild(lInput);
        });
    };



    export function ButtonSaveSettings(): void {
        const lSettingsTable = document.getElementById('SettingsTable') as HTMLTableElement;

        Array.from(lSettingsTable.rows).forEach(aRow => {
            const lKey = aRow.cells[0].textContent;
            const lValue = (aRow.cells[1].firstChild as HTMLInputElement).value;
            if (lKey) {
                cUserSettings[lKey] = lValue;
            }
        });

        localStorage.setItem('UserSettings', JSON.stringify(cUserSettings));
        UI.HidePanel('SettingsPanel');
        UI.ShowPanel('DrivingPanel');
    };



    export function ButtonCancelSettings(): void {
        PopulateSettingsTable();
        UI.HidePanel('SettingsPanel');
        UI.ShowPanel('DrivingPanel');
    };



    export function ButtonSettings(): void {
        UI.HidePanel('DrivingPanel');
        UI.ShowPanel('SettingsPanel');
    };
};



namespace Main {

    function ButtonToggleNewTripUI(): void { }  // Empty for now
    function RouteSelectionChanged(): void { }  // Empty for now
    function StopSelectionChanged(): void { }  // Empty for now
    function TripSelectionChanged(): void { }  // Empty for now
    function ButtonStartNewTrip(): void { }  // Empty for now
    function ButtonCancelNewTrip(): void { }  // Empty for now



    window.onload = () => {
        UI.ShowPanel('DrivingPanel');
        SettingsUI.LoadSettingsFromStorage();
        SettingsUI.PopulateSettingsTable();
    };
};
