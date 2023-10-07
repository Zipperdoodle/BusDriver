
namespace Util {

    export interface Coordinate {
        mX: number;
        mY: number;
    };



    export function DistanceComparator(aOrigin: Coordinate) {
        return (aPosition1: Coordinate, aPosition2: Coordinate): number => {
            const lDeltaX1 = aPosition1.mX - aOrigin.mX;
            const lDeltaY1 = aPosition1.mY - aOrigin.mY;
            const lDeltaX2 = aPosition2.mX - aOrigin.mX;
            const lDeltaY2 = aPosition2.mY - aOrigin.mY;
            const lDistanceSquared1 = lDeltaX1 * lDeltaX1 + lDeltaY1 * lDeltaY1;
            const lDistanceSquared2 = lDeltaX2 * lDeltaX2 + lDeltaY2 * lDeltaY2;
            return lDistanceSquared1 - lDistanceSquared2;
        };
    };



    export function DatePlusMilliSeconds(aDate: Date, aMilliSeconds: number): Date {
        return new Date(aDate.getTime() + aMilliSeconds);
    };



    export function DateFromStrings(aDateString: string, aTimeString: string): Date {
        return new Date(`${aDateString}T${aTimeString}`);
    };



    export function DateString(aDate: Date): string {
        return `${aDate.getFullYear()}-${(aDate.getMonth() + 1).toString().padStart(2, '0')}-${aDate.getDate().toString().padStart(2, '0')}`;
    };



    export function TimeString(aDate: Date): string {
        return `${aDate.getHours().toString().padStart(2, '0')}:${aDate.getMinutes().toString().padStart(2, '0')}:${aDate.getSeconds().toString().padStart(2, '0')}`;
    };
};



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
                    // lUrl.searchParams.append(encodeURIComponent(aKey), encodeURIComponent(lValue.toString()));
                    lUrl.searchParams.append(aKey, lValue.toString());
                }
            });
        }

        return lUrl.toString();
    };



    export async function FetchedData<T>(aApiEndpoint: string, aHeaders: Record<string, string>, aQueryParams?: QueryParams): Promise<FetchResult<T>> {
        try {
            const lUrlQueryString = UrlQueryString(aApiEndpoint, aQueryParams);
            console.log(`Fetching: ${lUrlQueryString}`);
            const lHeaders = { 'Content-Type': 'application/json', ...aHeaders };
            const lResponse = await fetch(lUrlQueryString, { method: 'GET', headers: lHeaders });
            const lData = await lResponse.json();
            console.log(`Fetch Response ${lResponse.status}: ***${JSON.stringify(lData)}***`);
            return { mData: lData, mResponseOk: lResponse.ok, mResponseStatus: lResponse.status, mErrorMessage: `Received status code ${lResponse.status}` };
        } catch (aError) {
            const lErrorMessage = (aError as Error).message;
            console.log(`Fetch Error: ${lErrorMessage}`)
            return { mResponseOk: false, mResponseStatus: -1, mErrorMessage: lErrorMessage };
        }
    };
};



namespace TransitLandAPIClient {

    export type Point2DGeometry = {
        coordinates: [
            number,
            number
        ];
        type: "Point";
    };

    export type Line3DGeometry = {
        coordinates: [
            [
                number,
                number,
                number
            ]
        ];
        type: "LineString";
    };

    export type MultiLine2DGeometry = {
        coordinates: [
            [
                number,
                number
            ]
        ];
        type: "MultiLineString";
    };

    export type ShapeSubset = {
        shape_id: string;
        generated: boolean;
    };

    export type FeedSubset = {
        id: number;
        onestop_id: string;
    };

    export type FeedVersionSubset = {
        feed: FeedSubset;
        id: number;
        fetched_at: string;
        sha1: string;

    };

    export type AgencySubset = {
        id: number;
        agency_id: string;
        agency_name: string;
        onestop_id: string;
    };

    export type AgencyPlace = {
        adm0_name: string;
        adm1_name: string;
        city_name: string;
    };

    export type OperatorFeedSubset = FeedSubset & {
        name: string | null;
        spec: string;
    };

    export type Operator = {
        agencies: (AgencySubset & AgencyPlace)[];
        feeds: OperatorFeedSubset[];
        id: number;
        name: string;
        onestop_id: string;
        short_name: string | null;
        tags: Record<string, string> | null;
        website: string | null;
    };

    export type BusStopSubset = {
        id: number;
        stop_id: string;
        stop_name: string;
        geometry: Point2DGeometry;
    };

    export type BusStopPlace = {
        adm0_iso: string;
        adm0_name: string;
        adm1_iso: string;
        adm1_name: string;
    };

    export type BusStop = BusStopSubset & {
        departures?: Departure[];
        location_type: number;
        onestop_id: string;
        parent?: BusStop | BusStopSubset | null; //??? TBD
        place: BusStopPlace;
        platform_code: string | null;
        stop_code: string;
        stop_desc: string;
        stop_timezone: string;
        stop_url: string;
        tts_stop_name: string | null;
        wheelchair_boarding: 0 | 1;
        zone_id: string;
    };

    export type BusStopTime = {
        arrival_time: string;
        departure_time: string;
        drop_off_type: number;
        interpolated: number | null;
        pickup_type: number;
        stop_headsign: string;
        stop_sequence: number;
        timepoint: 0 | 1;
    };

    export type BusStopWithTime = BusStopTime & {
        stop: BusStopSubset;
    };

    export type ScheduledTime = {
        delay: number | null;
        estimated: string | null;
        estimated_utc: string | null;
        scheduled: string;
        uncertainty: number | null;
    };

    export type Departure = BusStopTime & {
        arrival: ScheduledTime;
        continuous_drop_off: number | null;
        continuous_pickup: number | null;
        departure: ScheduledTime;
        service_date: string;
        shape_dist_traveled: number;
        trip: TripSubset
    };

    export type RouteSubset = {
        agency: AgencySubset;
        feed_version: FeedVersionSubset;
        continuous_drop_off: number | null;
        continuous_pickup: number | null;
        id: number;
        onestop_id: string;
        route_color: string;
        route_desc: string;
        route_id: string;
        route_long_name: string;
        route_short_name: string;
        route_sort_order: number;
        route_text_color: string;
        route_type: number;
        route_url: string;
        geometry?: MultiLine2DGeometry;
    };

    export type Route = RouteSubset & {
        route_stops: {
            stop: BusStopSubset;
        }[];
    };

    export type TripFrequency = {
        start_time: number;
        end_time: number;
        headway_secs: number;
        exact_times: number;
    };

    export type TripSubset = {
        bikes_allowed: 0 | 1;
        block_id: string;
        calendar?: {
            service_id: string;
            added_dates: string[];
            removed_dates: string[];
            start_date: string;
            end_date: string;
            friday: 0 | 1;
            monday: 0 | 1;
            saturday: 0 | 1;
            sunday: 0 | 1;
            thursday: 0 | 1;
            tuesday: 0 | 1;
            wednesday: 0 | 1;
        },
        feed_version: FeedVersionSubset;
        frequencies: TripFrequency[];
        id: number;
        direction_id: 0 | 1;
        shape: ShapeSubset;
        stop_pattern_id: number;
        trip_headsign: string;
        trip_id: string;
        trip_short_name: string;
        wheelchair_accessible: 0 | 1;
        route?: RouteSubset;
    };

    export type Trip = TripSubset & {
        shape: ShapeSubset & {
            geometry: Line3DGeometry;
        };
        stop_times: BusStopWithTime[];
    };

    export type TransitLandData = {
        meta?: {
            after?: number;
            next?: string;
        };
        operators?: Operator[];
        routes?: Route[];
        trips?: Trip[];
        stops?: BusStop[];
    };

    export type TransitLandArrayKey = "operators" | "routes" | "trips" | "stops";

    export type AsyncTransitLandFetchResult = Promise<Fetch.FetchResult<TransitLandData>>;



    export const cDefaultAPIBase = "https://transit.land/api/v2/rest";



    export async function FetchedTransitLandDataPage(aApiKey: string, aApiEndpoint: string, aQueryParams?: Fetch.QueryParams): AsyncTransitLandFetchResult {
        const lHeaders = { 'Content-Type': 'application/json', 'apikey': aApiKey };
        const lResponse = await Fetch.FetchedData<TransitLandData>(aApiEndpoint, lHeaders, aQueryParams);
        // lResponse.mData = lResponse.mData || {};
        return lResponse;
    };



    export async function FetchedTransitLandData<K extends TransitLandArrayKey>(aArrayKey: K, aApiKey: string, aApiEndpoint: string, aQueryParams?: Fetch.QueryParams): AsyncTransitLandFetchResult {
        const lData: TransitLandData = {};
        let lResponse: Fetch.FetchResult<TransitLandData> | null = null;
        let lLinkToNextSet: string | undefined = aApiEndpoint;

        do {
            lResponse = await FetchedTransitLandDataPage(aApiKey, lLinkToNextSet, aQueryParams);
            lData[aArrayKey] = [...(lData[aArrayKey] || []), ...(lResponse.mData?.[aArrayKey] || [])] as TransitLandData[K]; // Type assertion to make up for failure to infer.
            lLinkToNextSet = lResponse.mData?.meta?.next;
            aQueryParams = undefined;
        } while (lLinkToNextSet);

        if (lResponse.mData) {
            lResponse.mData[aArrayKey] = lData[aArrayKey];
        }

        return lResponse;
    };



    export function Client(aApiKey: string, aApiBase?: string) {
        const lApiBase = aApiBase || cDefaultAPIBase;
        return {
            FetchedOperators: async (aQueryParams: Fetch.QueryParams): AsyncTransitLandFetchResult => {
                const lApiEndpoint = `${lApiBase}/operators`;
                return await FetchedTransitLandData("operators", aApiKey, lApiEndpoint, aQueryParams);
            },
            FetchedOperator: async (aOperatorID: string): AsyncTransitLandFetchResult => {
                const lApiEndpoint = `${lApiBase}/operators/${aOperatorID}`;
                return await FetchedTransitLandData("operators", aApiKey, lApiEndpoint);
            },
            FetchedRoutes: async (aOperatorID: string, aQueryParams?: Fetch.QueryParams): AsyncTransitLandFetchResult => {
                const lApiEndpoint = `${lApiBase}/routes`;
                return await FetchedTransitLandData("routes", aApiKey, lApiEndpoint, { operator_onestop_id: aOperatorID, ...aQueryParams });
            },
            FetchedRoute: async (aRouteID: string, aQueryParams?: Fetch.QueryParams): AsyncTransitLandFetchResult => {
                const lApiEndpoint = `${lApiBase}/routes/${aRouteID}`;
                return await FetchedTransitLandData("routes", aApiKey, lApiEndpoint, aQueryParams);
            },
            FetchedTrips: async (aRouteID: string, aQueryParams?: Fetch.QueryParams): AsyncTransitLandFetchResult => {
                const lApiEndpoint = `${lApiBase}/routes/${aRouteID}/trips`;
                return await FetchedTransitLandData("trips", aApiKey, lApiEndpoint, aQueryParams);
            },
            FetchedTrip: async (aRouteID: string, aTripID: string): AsyncTransitLandFetchResult => {
                const lApiEndpoint = `${lApiBase}/routes/${aRouteID}/trips/${aTripID}`;
                return await FetchedTransitLandData("trips", aApiKey, lApiEndpoint);
            },
            FetchedBusStops: async (aQueryParams: Fetch.QueryParams): AsyncTransitLandFetchResult => {
                const lApiEndpoint = `${lApiBase}/stops`;
                return await FetchedTransitLandData("stops", aApiKey, lApiEndpoint, aQueryParams);
            },
            FetchedBusStop: async (aBusStopID: string): AsyncTransitLandFetchResult => {
                const lApiEndpoint = `${lApiBase}/stops/${aBusStopID}`;
                return await FetchedTransitLandData("stops", aApiKey, lApiEndpoint);
            },
            FetchedDepartures: async (aStopID: string, aQueryParams?: Fetch.QueryParams): AsyncTransitLandFetchResult => {
                const lApiEndpoint = `${lApiBase}/stops/${aStopID}/departures`;
                return await FetchedTransitLandData("stops", aApiKey, lApiEndpoint, aQueryParams);
            },
        };
    };
};



namespace UI {

    export function ShowPanel(aPanelID: string): void {
        const lPanel = document.getElementById(aPanelID);
        if (lPanel) {
            lPanel.style.display = 'block';
        }
    };



    export function HidePanel(aPanelID: string): void {
        const lPanel = document.getElementById(aPanelID);
        if (lPanel) {
            lPanel.style.display = 'none';
        }
    };



    export function PopulateDropdown(aElementID: string, aKeyValuePairs: [string, string][]): void {
        const lDropdown = document.getElementById(aElementID) as HTMLSelectElement;
        if (lDropdown) {
            lDropdown.options.length = 0; // Clear any existing options

            aKeyValuePairs.forEach(aKeyValuePair => {
                const [aKey, aValue] = aKeyValuePair;
                const lOptionElement = document.createElement('option');
                lOptionElement.text = aValue;
                lOptionElement.value = aKey;
                lDropdown.add(lOptionElement);
            });
        }
    }



    export function PopulateTable(aTableID: string, aData: Record<string, string | number>[], aHeaders: string[]): void {
        const lTable = document.getElementById(aTableID) as HTMLTableElement;

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
    };
};



namespace SettingsUI {

    export function LoadSettingsFromStorage(): void {
        const lStoredSettings = localStorage.getItem('UserSettings');
        if (lStoredSettings) {
            Object.assign(Main.cUserSettings, JSON.parse(lStoredSettings));
        }
        Main.cDestinationFilter = Main.cUserSettings.DestinationFilter.split(',').map(aDestination => aDestination.trim());
        // console.log(JSON.stringify(Main.cDestinationFilter));
    };



    export function PopulateSettingsTable(): void {
        const lSettingsTable = document.getElementById('SettingsTable') as HTMLTableElement;
        lSettingsTable.innerHTML = '';

        Object.entries(Main.cUserSettings).forEach(([aKey, aValue]) => {
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
                Main.cUserSettings[lKey] = lValue;
            }
        });

        localStorage.setItem('UserSettings', JSON.stringify(Main.cUserSettings));
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



namespace NewTripUI {

    export interface LocatedObject<T> extends Util.Coordinate {
        mObject: T;
    };



    export async function FetchRoutes(): Promise<void> {
        const lTransitLand = Main.TransitLand();
        const lOperatorID = Main.cUserSettings.OperatorID.trim();

        if (lTransitLand && lOperatorID.length > 0) {
            const lFetchResult = await lTransitLand.FetchedRoutes(lOperatorID);

            if (lFetchResult.mData?.routes) {
                const lFilteredRoutes = lFetchResult.mData.routes
                    .filter(aRoute => +aRoute.route_short_name > 0 && +aRoute.route_short_name < 500)
                    .filter(aRoute => Main.cDestinationFilter.some(aDestination => aRoute.route_long_name.includes(aDestination)));
                lFilteredRoutes.sort(
                    (aRoute1, aRoute2) => +aRoute1.route_short_name - +aRoute2.route_short_name
                );
                Main.cFetchedRoutes = lFilteredRoutes;
                const lKeyValuePairs = lFilteredRoutes.map(
                    aRoute => [aRoute.onestop_id, `${aRoute.route_short_name}: ${aRoute.route_long_name}`] as [string, string]
                );
                UI.PopulateDropdown("RoutesList", lKeyValuePairs)
            }
        }
    };



    export async function FetchBusStops(): Promise<void> {
        const lTransitLand = Main.TransitLand();
        const lRoutesList = document.getElementById('RoutesList') as HTMLSelectElement;
        const lRouteIndex = lRoutesList?.selectedIndex;

        if (Main.cCurrentPosition && lTransitLand && lRouteIndex >= 0) {
            const lCurrentLatitude = Main.cCurrentPosition.coords.latitude;
            const lCurrentLongitude = Main.cCurrentPosition.coords.longitude;
            const lRouteSubset = Main.cFetchedRoutes[lRouteIndex];
            const lFetchResult = await lTransitLand.FetchedRoute(lRouteSubset.onestop_id);

            if (lFetchResult.mData?.routes) {
                const lRoute = lFetchResult.mData?.routes[0];
                //!@#TODO: Sort the route_stops by distance from the current geolocation...
                const lBusStopLocations = lRoute.route_stops.map(
                    aBusStop => ({ mY: aBusStop.stop.geometry.coordinates[0], mX: aBusStop.stop.geometry.coordinates[1], mObject: aBusStop.stop } as LocatedObject<TransitLandAPIClient.BusStopSubset>)
                );
                lBusStopLocations.sort(Util.DistanceComparator({ mX: lCurrentLatitude, mY: lCurrentLongitude }));
                const lKeyValuePairs = lBusStopLocations.map(
                    aBusStopLocation => [aBusStopLocation.mObject.id.toString(), `[${aBusStopLocation.mObject.stop_id}] ${aBusStopLocation.mObject.stop_name}`] as [string, string]
                );
                UI.PopulateDropdown("BusStopsList", lKeyValuePairs)
                Main.cFetchedRoute = lRoute;
            }
        }
    };



    export async function FetchTrips(): Promise<void> {
        const lTransitLand = Main.TransitLand();
        const lBusStopsList = document.getElementById('BusStopsList') as HTMLSelectElement;
        const lBusStopID = lBusStopsList?.value;

        if (Main.cFetchedRoute && lTransitLand && lBusStopID) {
            const lDateInput = document.getElementById('TripSearchDate') as HTMLInputElement;
            const lStartTimeInput = document.getElementById('TripSearchStart') as HTMLInputElement;
            const lMinutesInput = document.getElementById('TripSearchMinutes') as HTMLInputElement;
            const lStartTime = Util.DateFromStrings(lDateInput.value, lStartTimeInput.value);
            const lEndTime = Util.DatePlusMilliSeconds(lStartTime, +lMinutesInput.value * 60 * 1000);
            const lQueryParams = {
                service_date: lDateInput.value,
                start_time: lStartTimeInput.value,
                end_time: Util.TimeString(lEndTime)
            };
            console.log(lQueryParams);
            const lFetchResult = await lTransitLand.FetchedDepartures(lBusStopID, lQueryParams);

            if (lFetchResult.mData?.stops) {
                const lDepartures = lFetchResult.mData?.stops[0].departures;
                const lKeyValuePairs = lDepartures?.map(
                    aDeparture => [aDeparture.trip.id.toString(), `[${aDeparture.departure_time}] ${aDeparture.trip.trip_headsign}`] as [string, string]
                );
                UI.PopulateDropdown("TripsList", lKeyValuePairs || [])
            }
        }
    };



    export function ButtonStartNewTrip(): void {
        UI.HidePanel('NewTripPanel');
        UI.ShowPanel('DrivingPanel');
    };



    export function ButtonCancelNewTrip(): void {
        UI.HidePanel('NewTripPanel');
        UI.ShowPanel('DrivingPanel');
    };



    export function ButtonNewTrip(): void {
        const lNow = Main.CurrentTime();
        const lDateString = Util.DateString(lNow);
        const lTimeString = Util.TimeString(lNow);
        const lDateInput = document.getElementById('TripSearchDate') as HTMLInputElement;
        const lStartTimeInput = document.getElementById('TripSearchStart') as HTMLInputElement;

        // Set the values of the input elements
        lDateInput.value = lDateString;
        lStartTimeInput.value = lTimeString;

        UI.HidePanel('DrivingPanel');
        UI.ShowPanel('NewTripPanel');
    };
};



namespace Main {

    export const cUserSettings: Record<string, string> = {
        TransitLandAPIKey: '',
        OperatorID: '',
        BusStopDelaySeconds: '30',
        DestinationFilter: 'Utrecht, Woerden, Mijdrecht',
    };

    export let cDestinationFilter: string[];
    export let cFetchedRoutes: TransitLandAPIClient.Route[];
    export let cFetchedRoute: TransitLandAPIClient.Route;
    export let cFetchedTrip: TransitLandAPIClient.Trip;
    export let cCurrentPosition: GeolocationPosition;
    export let cInitializationTime = new Date();
    export let cSimulationStartTime = cInitializationTime;



    export function CurrentTime(): Date {
        const lNow = new Date();
        const lElapsedTime = lNow.getTime() - cInitializationTime.getTime();
        const lSimulatedNow = Util.DatePlusMilliSeconds(cSimulationStartTime, lElapsedTime);
        return lSimulatedNow;
        // return lNow
    };



    export function TransitLand() {
        const lApiKey = cUserSettings.TransitLandAPIKey.trim();

        if (lApiKey) {
            return TransitLandAPIClient.Client(lApiKey);
        }
    };



    export let cPositionUpdateCounter = 0;
    export function PositionWatch(aPosition: GeolocationPosition) {
        const lCoordinate = aPosition.coords;
        const lCoordinateSpan = document.getElementById('CoordinateSpan') as HTMLSpanElement;
        lCoordinateSpan.textContent = `Lat: ${lCoordinate.latitude}, Lon: ${lCoordinate.longitude} (${new Date(aPosition.timestamp).toLocaleString()} - ${cPositionUpdateCounter})`;
        cCurrentPosition = aPosition;
    };



    window.onload = () => {
        UI.ShowPanel('DrivingPanel');
        SettingsUI.LoadSettingsFromStorage();
        SettingsUI.PopulateSettingsTable();

        const lEndTimeInput = document.getElementById('TripSearchMinutes') as HTMLInputElement;
        lEndTimeInput.value = "10";

        const lWatchID = navigator.geolocation.watchPosition(PositionWatch);
    };
};
