
namespace Util {

    export interface Coordinates {
        mX: number;
        mY: number;
    };



    export interface LocatedObject<T> extends Coordinates {
        mObject: T;
    };



    export function Clamp(aValue: number, aMinimum: number, aMaximum: number): number {
        return Math.min(Math.max(aValue, aMinimum), aMaximum);
    };



    // aOrigin = closest trip point, aFrom = preceding trip point, aTo = Bus stop
    // If the resulting angle <90 degrees, then the bus stop is ahead of the closest trip point,
    // and the distance between them needs to be subtracted from the total travel distance to the stop,
    // else the closest point is ahead of the stop and the distance to the stop needs to be added.
    export function Angle(aOrigin: Coordinates, aFrom: Coordinates, aTo: Coordinates): number {
        const lLineA = {
            mX: aOrigin.mX - aFrom.mX,
            mY: aOrigin.mY - aFrom.mY
        };
        const lLineB = {
            mX: aOrigin.mX - aTo.mX,
            mY: aOrigin.mY - aTo.mY
        };

        const lDotProduct = lLineB.mX * lLineA.mX + lLineB.mY * lLineA.mY;
        const lMagnitudeA = Math.sqrt(lLineB.mX * lLineB.mX + lLineB.mY * lLineB.mY);
        const lMagnitudeB = Math.sqrt(lLineA.mX * lLineA.mX + lLineA.mY * lLineA.mY);
        const lAngleRadians = Math.acos(lDotProduct / (lMagnitudeA * lMagnitudeB));

        return lAngleRadians * 180 / Math.PI;
    };



    export function CircumferenceAtLatitude(aEquatorialCircumference: number, aPolarCircumference: number, aLatitude: number): number {
        const lEquatorialRadius: number = aEquatorialCircumference / (2 * Math.PI);
        const lPolarRadius: number = aPolarCircumference / (2 * Math.PI);
        const lLatitudeRadians: number = aLatitude * (Math.PI / 180);
        const lCosLatitudeSquared: number = Math.cos(lLatitudeRadians) ** 2;
        const lSinLatitudeSquared: number = Math.sin(lLatitudeRadians) ** 2;
        const lAverageRadius: number = Math.sqrt((lEquatorialRadius ** 2 * lCosLatitudeSquared + lPolarRadius ** 2 * lSinLatitudeSquared) / 2);
        return 2 * Math.PI * lAverageRadius;
    }



    export function GeoDistance(aPoint1: Coordinates, aPoint2: Coordinates): number {
        // Calculates the distance in meters between two latitude/longitude geolocation coordinates.
        // X (vertical) is longitude, Y (vertical) is latitude.
        // This uses a euclidian approach that works well over relatively short distances.
        // It takes into account that the earth is an oblate spheroid.
        const lDeltaLatitude = aPoint2.mY - aPoint1.mY;
        const lDeltaLongitude = aPoint2.mX - aPoint1.mX;
        const lAverageLatitude = (aPoint1.mY + aPoint2.mY) / 2;

        // Convert degrees to meters according to earth's polar and equatorial circumference.
        const lEarthPolarCircumference = 40007863;
        const lEarthEquatorialCircumference = 40075017;
        const lEarthCircumferenceAtLatitude = CircumferenceAtLatitude(lEarthEquatorialCircumference, lEarthPolarCircumference, lAverageLatitude);
        const lDeltaY = lDeltaLatitude * (lEarthPolarCircumference / 360);
        const lDeltaX = lDeltaLongitude * (lEarthCircumferenceAtLatitude / 360);
        // const lDeltaX = lDeltaLongitude * (lEarthEquatorialCircumference / 360) * Math.cos(lAverageLatitude * Math.PI / 180);

        const lDistance = Math.sqrt(lDeltaX * lDeltaX + lDeltaY * lDeltaY);
        // console.log(`(${lDeltaLongitude}, ${lDeltaLatitude})deg = ${lDistance}m`);
        return lDistance;
    };



    export function CartesianDistance(aPoint1: Coordinates, aPoint2: Coordinates): number {
        const lDeltaX1 = aPoint2.mX - aPoint1.mX;
        const lDeltaY1 = aPoint2.mY - aPoint1.mY;
        return Math.sqrt(lDeltaX1 * lDeltaX1 + lDeltaY1 * lDeltaY1);
    };



    export function DistanceComparator(aOrigin: Coordinates, aDistanceFunction: (aPoint1: Coordinates, aPoint2: Coordinates) => number) {
        return (aPosition1: Coordinates, aPosition2: Coordinates): number => {
            return aDistanceFunction(aOrigin, aPosition1) - aDistanceFunction(aOrigin, aPosition2);
        };
    };



    export function PerpendicularDistanceMapper(aPoint: Coordinates) {
        return (aLineStart: Coordinates, aLineEnd: Coordinates) => {
            const lSlope = (aLineEnd.mY - aLineStart.mY) / (aLineEnd.mX - aLineStart.mX);
            const lYIntercept = aLineStart.mY - lSlope * aLineStart.mX;
            return Math.abs(lSlope * aPoint.mX - aPoint.mY + lYIntercept) / Math.sqrt(lSlope * lSlope + 1);;
        }
    }



    export function DeltaTime(aDate1: Date, aDate2: Date): number {
        return aDate2.getTime() - aDate1.getTime();
    };



    export function DurationStringHHMMSS(aMilliSeconds: number): string {
        const lAbsDeltaMilliseconds = Math.abs(aMilliSeconds);
        const lHours = Math.floor(lAbsDeltaMilliseconds / (1000 * 60 * 60));
        const lMinutes = Math.floor((lAbsDeltaMilliseconds % (1000 * 60 * 60)) / (1000 * 60));
        const lSeconds = Math.floor((lAbsDeltaMilliseconds % (1000 * 60)) / 1000);
        const lFormattedHours = lHours.toString().padStart(2, '0');
        const lFormattedMinutes = lMinutes.toString().padStart(2, '0');
        const lFormattedSeconds = lSeconds.toString().padStart(2, '0')
        const lSign = aMilliSeconds < 0 ? '-' : '+';
        return `${lSign}${lFormattedHours}:${lFormattedMinutes}:${lFormattedSeconds}`;
    }



    export function DurationStringMMSS(aMilliSeconds: number): string {
        const lAbsDeltaMilliseconds = Math.abs(aMilliSeconds);
        const lMinutes = Math.floor(lAbsDeltaMilliseconds / (1000 * 60));
        const lSeconds = Math.floor((lAbsDeltaMilliseconds % (1000 * 60)) / 1000);
        const lFormattedMinutes = lMinutes.toString().padStart(2, '0');
        const lFormattedSeconds = lSeconds.toString().padStart(2, '0')
        const lSign = aMilliSeconds < 0 ? '-' : '+';
        return `${lSign}${lFormattedMinutes}:${lFormattedSeconds}`;
    }



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
                number // NOTE: No idea what TransitLand uses the 3rd coordinate for but it's definitely not altitude,
            ]          // and if it's total trip distance then I don't know what unit.
        ];
        type: "LineString";
    };

    export type MultiLine2DGeometry = {
        coordinates: [ // NOTE: TransitLand appears to store these as longitude / latitude (instead of v.v.)
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



    export function PopulateTable(aTableID: string, aData: Record<string, string | number>[], aHeaders: string[], aPopulateHeaders: boolean = true): void {
        const lTable = document.getElementById(aTableID) as HTMLTableElement;

        if (lTable) {
            //!@#TODO: Runtime check that lTable is indeed a table element

            lTable.innerHTML = '';  // Clear existing table data

            if (aPopulateHeaders) {
                // Create table header
                const lTableHead = lTable.createTHead();
                const lHeaderRow = lTableHead.insertRow();
                aHeaders.forEach(aHeader => {
                    const lHeaderCell = document.createElement('th');
                    lHeaderCell.textContent = aHeader;
                    lHeaderRow.appendChild(lHeaderCell);
                });
            }

            // Create table body
            const lTableBody = lTable.createTBody();
            aData.forEach(aRowData => {
                const lDataRow = lTableBody.insertRow();
                aHeaders.forEach(aHeader => {
                    const lDataCell = lDataRow.insertCell();
                    lDataCell.innerHTML = aRowData[aHeader].toString();
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
        Main.ProcessUserSettings();
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



    export function OpenSettingsUI(): void {
        UI.HidePanel('DrivingPanel');
        UI.ShowPanel('SettingsPanel');
    };



    export function CloseSettingsUI(): void {
        DrivingUI.Update();
        UI.HidePanel('SettingsPanel');
        UI.ShowPanel('DrivingPanel');
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

        Main.ProcessUserSettings();
        localStorage.setItem('UserSettings', JSON.stringify(Main.cUserSettings));
        CloseSettingsUI();
    };



    export function ButtonCancelSettings(): void {
        PopulateSettingsTable();
        CloseSettingsUI();
    };
};



namespace NewTripUI {

    export function PopulateRoutes(): void {
        const lOperatorID = Main.cUserSettings.OperatorID.trim();

        if (lOperatorID.length > 0) {
            const lRoutesJSON = localStorage.getItem(`RouteList_${lOperatorID}`);

            if (lRoutesJSON) {
                const lRoutes: TransitLandAPIClient.Route[] = JSON.parse(lRoutesJSON);
                const lFilteredRoutes = lRoutes
                    .filter(aRoute => +aRoute.route_short_name > 0 && +aRoute.route_short_name < 500)
                    .filter(aRoute => Main.cDestinationFilter.some(aDestination => aRoute.route_long_name.includes(aDestination)));
                lFilteredRoutes.sort((aRoute1, aRoute2) => +aRoute1.route_short_name - +aRoute2.route_short_name);
                DrivingUI.cFetchedRoutes = lFilteredRoutes;
                const lKeyValuePairs = lFilteredRoutes.map(aRoute =>
                    [aRoute.onestop_id, `${aRoute.route_short_name}: ${aRoute.route_long_name}`] as [string, string]
                );
                UI.PopulateDropdown("RouteList", lKeyValuePairs)
                DrivingUI.Update();
            }
        }
    };


    export async function FetchRoutes(): Promise<void> {
        const lTransitLand = Main.TransitLand();
        const lOperatorID = Main.cUserSettings.OperatorID.trim();

        if (lTransitLand && lOperatorID.length > 0) {
            const lFetchResult = await lTransitLand.FetchedRoutes(lOperatorID);

            if (lFetchResult.mData?.routes) {
                localStorage.setItem(`RouteList_${lOperatorID}`, JSON.stringify(lFetchResult.mData.routes));
                PopulateRoutes();
            }
        }
    };



    export async function FetchBusStops(): Promise<void> {
        const lTransitLand = Main.TransitLand();
        const lRouteList = document.getElementById('RouteList') as HTMLSelectElement;
        const lRouteIndex = lRouteList.selectedIndex;

        if (Main.cCurrentPosition && lTransitLand && lRouteIndex >= 0) {
            const lCurrentLatitude = Main.cCurrentPosition.coords.latitude;
            const lCurrentLongitude = Main.cCurrentPosition.coords.longitude;
            const lRouteSubset = DrivingUI.cFetchedRoutes[lRouteIndex];
            const lFetchResult = await lTransitLand.FetchedRoute(lRouteSubset.onestop_id);

            if (lFetchResult.mData?.routes) {
                const lRoute = lFetchResult.mData?.routes[0];
                const lBusStopLocations = lRoute.route_stops.map(aBusStop =>
                    ({ mX: aBusStop.stop.geometry.coordinates[0], mY: aBusStop.stop.geometry.coordinates[1], mObject: aBusStop.stop } as Util.LocatedObject<TransitLandAPIClient.BusStopSubset>)
                );
                lBusStopLocations.sort(Util.DistanceComparator({ mX: lCurrentLongitude, mY: lCurrentLatitude }, Util.GeoDistance));
                const lKeyValuePairs = lBusStopLocations.map(aBusStopLocation =>
                    [aBusStopLocation.mObject.id.toString(), `[${aBusStopLocation.mObject.stop_id}] ${aBusStopLocation.mObject.stop_name}`] as [string, string]
                );
                UI.PopulateDropdown("BusStopList", lKeyValuePairs)
                DrivingUI.cFetchedRoute = lRoute;
            }
        }
        DrivingUI.Update();
    };



    export function TripListChanged() {
        const lTripList = document.getElementById('TripList') as HTMLSelectElement;
        const lTripIndex = lTripList.selectedIndex;

        if (lTripIndex >= 0) {
            const lDeparture = DrivingUI.cFetchedDepartures[lTripIndex];
            const lTripStartTime = lDeparture.departure_time;
            const lSimulatedTimeInput = document.getElementById('SimulatedTimeStart') as HTMLInputElement;
            lSimulatedTimeInput.value = lTripStartTime;
        }
    };



    export async function FetchTrips(): Promise<void> {
        const lTransitLand = Main.TransitLand();
        const lBusStopList = document.getElementById('BusStopList') as HTMLSelectElement;
        const lBusStopID = lBusStopList.value;

        if (DrivingUI.cFetchedRoute && lTransitLand && lBusStopID) {
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
                if (lDepartures) {
                    const lKeyValuePairs = lDepartures.map(aDeparture =>
                        [aDeparture.trip.id.toString(), `[${aDeparture.departure_time}] ${aDeparture.trip.route?.route_short_name}: ${aDeparture.trip.trip_headsign}`] as [string, string]
                    );
                    UI.PopulateDropdown("TripList", lKeyValuePairs || [])
                    DrivingUI.cFetchedDepartures = lDepartures;
                    TripListChanged();
                }
            }
        }
        DrivingUI.Update();
    };



    export function TripSearchStartChanged(): void {
        console.log("TripSearchStartChanged");
        const lStartTimeInput = document.getElementById('TripSearchStart') as HTMLInputElement;
        const lSimulatedTimeInput = document.getElementById('SimulatedTimeStart') as HTMLInputElement;
        lSimulatedTimeInput.value = lStartTimeInput.value;
        DrivingUI.Update();
    };



    export function OpenNewTripUI(): void {
        const lNow = Main.CurrentTime();
        const lStartTime = Util.DatePlusMilliSeconds(lNow, +Main.cUserSettings.NewTripSearchStartTimeOffset * 60 * 1000);
        const lDateString = Util.DateString(lNow);
        const lTimeString = Util.TimeString(lNow);
        const lStartTimeString = Util.TimeString(lStartTime);
        const lDateInput = document.getElementById('TripSearchDate') as HTMLInputElement;
        const lStartTimeInput = document.getElementById('TripSearchStart') as HTMLInputElement;
        const lSimulatedTimeInput = document.getElementById('SimulatedTimeStart') as HTMLInputElement;

        // Set the values of the input elements
        lDateInput.value = lDateString;
        lStartTimeInput.value = lStartTimeString;
        lSimulatedTimeInput.value = lTimeString;

        PopulateRoutes();

        UI.HidePanel('DrivingPanel');
        UI.ShowPanel('NewTripPanel');
        DrivingUI.Update();
    };



    export function CloseNewTripUI(): void {
        DrivingUI.Update();
        UI.HidePanel('NewTripPanel');
        UI.ShowPanel('DrivingPanel');
    };



    export async function ButtonStartNewTrip(): Promise<void> {
        const lTransitLand = Main.TransitLand();
        const lTripList = document.getElementById('TripList') as HTMLSelectElement;
        const lTripIndex = lTripList.selectedIndex;

        if (lTransitLand && lTripIndex >= 0) {
            const lDeparture = DrivingUI.cFetchedDepartures[lTripIndex];
            const lTripID = lDeparture.trip.id;
            const lRouteID = lDeparture.trip.route?.onestop_id;

            if (lRouteID && DrivingUI.cFetchedTrip?.id != lTripID) {
                const lFetchResult = await lTransitLand.FetchedTrip(lRouteID, lTripID.toString());
                if (lFetchResult.mData?.trips) {
                    DrivingUI.cFetchedTrip = lFetchResult.mData.trips[0];
                }
            }
        }

        DrivingUI.StartTrip();
        CloseNewTripUI();
    };



    export function ButtonCancelNewTrip(): void {
        CloseNewTripUI();
    };



    export function ButtonSetCurrentTime(): void {
        const lNow = new Date();
        Main.SimulatedTimeSync(lNow, lNow);
        DrivingUI.Update();
    };



    export function ButtonSetSimulatedTime(): void {
        const lDateInput = document.getElementById('TripSearchDate') as HTMLInputElement;
        const lTripList = document.getElementById('TripList') as HTMLSelectElement;
        const lSimulatedTimeInput = document.getElementById('SimulatedTimeStart') as HTMLInputElement;
        Main.SimulatedTimeSync(new Date(), Util.DateFromStrings(lDateInput.value, lSimulatedTimeInput.value));
        DrivingUI.Update();
    };
};



namespace DrivingUI {

    export type AugmentedBusStop = {
        mCoordinates: Util.Coordinates;
        mBusStop: TransitLandAPIClient.BusStopWithTime;
        mTripDistanceToHere: number;
    };

    export type AugmentedTripGeometry = {
        mCoordinates: Util.Coordinates;
        mDrivingInfo: {
            mTripDistanceToHere: number;
            mBusStop?: AugmentedBusStop;
        };
    };



    export let cFetchedRoutes: TransitLandAPIClient.Route[];
    export let cFetchedRoute: TransitLandAPIClient.Route;
    export let cFetchedDepartures: TransitLandAPIClient.Departure[];
    export let cFetchedTrip: TransitLandAPIClient.Trip;
    export let cRemainingBusStops: AugmentedBusStop[];
    export let cRemainingTripPoints: AugmentedTripGeometry[];
    export let cAtBusStop = false;
    export let cMinSpeed: number;
    export let cMaxSpeed: number;
    export let cExactSpeed: number;
    export let cCurrentDelay: number;
    export let cCurrentEta: number;
    export let cPunctualityString: string;
    export let cLastDistanceToTripPoint: number;
    export let cDistanceTravelled: number;



    /*
        export function GenerateTripStopCorrelations(): void {
            console.log("=== GenerateTripStopCorrelations Begin ===");
    
    
            // !@#TODO: Complete this declarative version of the imperative code below it...
            // function ClosestPoint(aBusStop, aTripPoints) {
            //     return aTripPoints.reduce((aClosestPoint, aPoint) => {
            //         const lDistance = Util.GeoDistance(aBusStop, aPoint);
            //         return lDistance < aClosestPoint.distance ? { Point: aPoint, Distance: lDistance } : aClosestPoint;
            //     }, { Point: null, Distance: Infinity });
            // }
            
            // const cTripStopCorrelations = cRemainingBusStops.map(aBusStop => ClosestPoint(aBusStop, cFetchedTrip.shape.geometry.coordinates).Point);
            
    
            cTripStopCorrelations = cRemainingBusStops.map((aBusStop) => {
                let lShortestDistance = 999999;
                let lClosestTripPointIndex = -1;
                const lTripPoints = cFetchedTrip.shape.geometry.coordinates;
                lTripPoints.forEach((aTripPoint, aTripPointIndex) => {
                    const lCurrentTripPointCoordinates: Util.Coordinates = { mX: aTripPoint[0], mY: aTripPoint[1] };
                    const lCurrentDistance = Util.GeoDistance(aBusStop, lCurrentTripPointCoordinates);
                    if (lCurrentDistance < lShortestDistance) {
                        //!@#TODO: Calculate angle between bus stop, closest point, and previous point, to determine if closest is ahead of stop or behind.
                        // Store whichever closest point that is still ahead of the stop!
                        lShortestDistance = lCurrentDistance;
                        lClosestTripPointIndex = aTripPointIndex;
                    }
                });
    
                console.log(`Trip Point ${lClosestTripPointIndex}, CurDist ${lShortestDistance}, ${aBusStop.mObject.stop.stop_name}`);
    
                return {
                    mBusStop: aBusStop,
                    mTripPointIndex: lClosestTripPointIndex,
                };
            });
            console.log("=== GenerateTripStopCorrelations End ===");
        };
    
    
    
        export function GenerateAugmentedGeometry(): void {
            cAugmentedGeometry = {
                mGeometry: cFetchedTrip.shape.geometry,
                mDrivingInfo: cFetchedTrip.shape.geometry.coordinates.map(aPoint3D => {
                    const lNextStop = cRemainingBusStops[0];//!@#TODO...
                    let lTripDistanceToHere = 0;
                    let lDistanceToNextPoint = 0;
                    let lDistanceToNextStop = 0;
                    return {
                        mTripDistanceToHere: lTripDistanceToHere,
                        mDistanceToNextPoint: lDistanceToNextPoint,
                        mDistanceToNextStop: lDistanceToNextStop,
                        mNextStop: lNextStop,
                    };
                }),
            };
        };
    */


    export function AdvanceToClosestStop(aCurrentGeoLocation: GeolocationCoordinates): void {
        const lCurrentLocation = { mX: aCurrentGeoLocation.longitude, mY: aCurrentGeoLocation.latitude };
        const lDistanceComparator = Util.DistanceComparator(lCurrentLocation, Util.GeoDistance);

        while (cRemainingBusStops?.length > 1) {
            const lStopCoordinates0 = cRemainingBusStops[0].mBusStop.stop.geometry.coordinates;
            const lStopCoordinates1 = cRemainingBusStops[1].mBusStop.stop.geometry.coordinates;
            const lStopLocation0: Util.Coordinates = { mX: lStopCoordinates0[0], mY: lStopCoordinates0[1] };
            const lStopLocation1: Util.Coordinates = { mX: lStopCoordinates1[0], mY: lStopCoordinates1[1] };
            const lDeltaDistance = lDistanceComparator(lStopLocation0, lStopLocation1);

            if (lDeltaDistance > 0) {
                const lByeStop = cRemainingBusStops.shift();
                console.log(`Skipping ${lByeStop?.mBusStop.stop.stop_name} at distance ${Util.GeoDistance(lCurrentLocation, lStopLocation0)}`);
                console.log(`   in favor of ${cRemainingBusStops[0].mBusStop.stop.stop_name} at distance ${Util.GeoDistance(lCurrentLocation, lStopLocation1)}`);
            } else {
                if (Util.GeoDistance(lCurrentLocation, lStopLocation0) < +Main.cUserSettings.AtBusStopRange) {
                    cAtBusStop = true;
                    console.log(`Approaching stop ${cRemainingBusStops[0].mBusStop.stop.stop_name} at distance ${Util.GeoDistance(lCurrentLocation, lStopLocation0)}`);
                } else {
                    if (cAtBusStop) {
                        cAtBusStop = false;
                        const lByeStop = cRemainingBusStops.shift();
                        console.log(`Passing stop ${lByeStop?.mBusStop.stop.stop_name} at distance ${Util.GeoDistance(lCurrentLocation, lStopLocation0)}`);
                    }
                }
                break;
            }
        }
    };


    /*
        export function CheckNextStop(aCurrentCoordinates: Util.Coordinates): number {
            let lDistanceToNextStop = Util.GeoDistance(aCurrentCoordinates, cRemainingBusStops[0]);
    
            // If distance to bus stop is increasing, assume that we've passed it.
            //!@#TODO: This is guaranteed to fail! Track distance to trip points instead. You've passed a bus stop once you reach the first trip point beyond it.
            const cPreviousDistanceToNextStop = Infinity;//!@#DELETEME
            if (lDistanceToNextStop > cPreviousDistanceToNextStop) {
                if (cRemainingBusStops.length > 1) { // Don't remove the final stop.
                    cRemainingBusStops.shift();
                }
                lDistanceToNextStop = Util.GeoDistance(aCurrentCoordinates, cRemainingBusStops[0]);
            }
    
            return lDistanceToNextStop;
        };
    
    
    
        export function NextTripStopCorrelationIndex(aTripPointIndex: number): number {
            let lIndex = -1;
            while (++lIndex < cTripStopCorrelations.length) {
                if (cTripStopCorrelations[lIndex].mTripPointIndex >= aTripPointIndex) {
                    return lIndex;
                }
            };
            return -1;
        };
    */


    export function RelevantBusStops(): AugmentedBusStop[] {
        // Isolate all stops that will appear on Driving UI.
        const lRelevantBusStops = [cRemainingBusStops[0]];

        if (cRemainingBusStops.length > 1) lRelevantBusStops.push(cRemainingBusStops[1]);
        if (cRemainingBusStops.length > 2) lRelevantBusStops.push(cRemainingBusStops[2]);

        if (cRemainingBusStops.length > 3) {
            // Add the next timepoint.
            let lIndex = 3;
            while (lIndex < cRemainingBusStops.length) {
                if (cRemainingBusStops[lIndex].mBusStop.timepoint === 1) {
                    lRelevantBusStops.push(cRemainingBusStops[lIndex]);
                    break;
                }
                lIndex++;
            }
            // Add the final stop.
            lRelevantBusStops.push(cRemainingBusStops[cRemainingBusStops.length - 1]);
        };

        return lRelevantBusStops;
    };



    export function UpcomingStopsTableValues(aCurrentCoordinates: Util.Coordinates, aCurrentTime: Date, aRelevantBusStops: AugmentedBusStop[]): Record<string, string>[] {
        const lDateString = Util.DateString(aCurrentTime);

        const lUpcomingStopsTableValues = aRelevantBusStops.map((aBusStop, aIndex) => {
            const lDepartureTimeString = aBusStop.mBusStop.departure_time;
            const lDepartureTime = Util.DateFromStrings(lDateString, lDepartureTimeString);
            const lCountdown = Util.DeltaTime(aCurrentTime, lDepartureTime);

            const lDistance = aBusStop.mTripDistanceToHere - cDistanceTravelled //Util.GeoDistance(aCurrentCoordinates, lBusStopCoordinates);
            const lAvgSpeedMin = Util.Clamp(3.6 * lDistance / (lCountdown / 1000 + (+Main.cUserSettings.DepartureMaxDelay)), 0, 99); // Average Km/h at max allowed delay
            const lAvgSpeedMax = Util.Clamp(3.6 * lDistance / (lCountdown / 1000 + (+Main.cUserSettings.DepartureMaxLead)), 0, 99); // Average Km/h at max allowed lead time
            const lAvgSpeedExact = Util.Clamp(3.6 * lDistance / (lCountdown / 1000), 0, 99); // Average Km/h at exact schedule time
            const lAdjSpeedMin = "---"; // Average min speed adjusted for historic recorded speeds/delays on trip/route
            const lAdjSpeedMax = "---"; // Average max speed adjusted for historic recorded speeds/delays on trip/route
            // const lDeltaETA = Util.Clamp(1000 * lDistance / (Main.cCurrentPosition.coords.speed || 0), 0, (99 * 3600 + 59 * 60 + 59) * 1000);
            const lSpeed = Main.cCurrentPosition.coords.speed || 0;
            const lDeltaETA = 1000 * lDistance / lSpeed;
            const lDelay = lDeltaETA - lCountdown;
            const lETAString = `${Util.DurationStringHHMMSS(lDelay)} (${Util.DurationStringHHMMSS(lDeltaETA)})`;

            if (aIndex == 0) {
                cMinSpeed = lAvgSpeedMin;
                cMaxSpeed = lAvgSpeedMax;
                cExactSpeed = lAvgSpeedExact;
                cPunctualityString = lETAString;
                cCurrentDelay = lDelay;
                cCurrentEta = lDeltaETA;
            }

            return {
                Time: `Dep: ${aBusStop.mBusStop.departure_time} (${Util.DurationStringHHMMSS(lCountdown)})<br>ETA: ${lSpeed > 0.01 ? lETAString : "---"}`,
                T: aBusStop.mBusStop.timepoint > 0 ? "T" : "",
                Name: aIndex == 0 && cAtBusStop ? `*** ${aBusStop.mBusStop.stop.stop_name}` : aBusStop.mBusStop.stop.stop_name,
                Distance: lDistance < 1000 ? `${Math.round(lDistance)}m` : `${Math.round(lDistance / 100) / 10}km`,
                AvgSpeed: `${Math.round(lAvgSpeedExact)}km/h<br>(${Math.round(lAvgSpeedMin)} - ${Math.round(lAvgSpeedMax)})`,
                AdjSpeed: `${lAdjSpeedMin} - ${lAdjSpeedMax}`,
            };
        });

        // const lFinalDestinationSpacerRow = { DepartureTime: "<span class='small-ui'>Final Destination:</span>", T: "---", Name: "---", AvgSpeed: "---", AdjSpeed: "---", ETA: "---" };
        // const lTimepointSpacerRow = { DepartureTime: "<span class='small-ui'>Next Timepoint:</span>", T: "---", Name: "---", AvgSpeed: "---", AdjSpeed: "---", ETA: "---" };
        // const lTimepointAbsentRow = { DepartureTime: "", T: "", Name: "", AvgSpeed: "", AdjSpeed: "", ETA: "" };
        const lSpacerRow = { Time: "<span class='small-ui'>Next Timepoint & Final Destination:</span>", T: "---", Name: "---", Distance: "---", AvgSpeed: "---", AdjSpeed: "---" };
        lUpcomingStopsTableValues.splice(3, 0, lSpacerRow);
        return lUpcomingStopsTableValues;
    };



    /*
        export function ClosestTripPointIndex(aCurrentCoordinates: Util.Coordinates): number {
            const lGeometry = cFetchedTrip.shape.geometry.coordinates;
            let lClosestDistance = Infinity;
    
            lGeometry.forEach((aPoint, aIndex) => {
                const lDistance = Util.GeoDistance(aCurrentCoordinates, { mX: aPoint[0], mY: aPoint[1] });
                if (lDistance < lClosestDistance) {
                    cCurrentTripPointIndex = aIndex;
                    lClosestDistance = lDistance;
                }
            });
    
            return cCurrentTripPointIndex;
        };
    */



    export function ClosestTripPoint(aTrip: AugmentedTripGeometry[], aCoordinates: Util.Coordinates): AugmentedTripGeometry {
        let lResult = aTrip[0];
        let lClosestDistance = Infinity;
        let lClosestIndex = 0;

        aTrip.forEach((aTripPoint, aIndex) => {
            const lDistance = Util.GeoDistance(aCoordinates, aTripPoint.mCoordinates);
            if (lDistance < lClosestDistance) {
                lClosestDistance = lDistance;
                lClosestIndex = aIndex;
                lResult = aTripPoint;
            }
        });

        return lResult;
    };



    export function GenerateAugmentedBusStops() {
        cRemainingBusStops = cFetchedTrip.stop_times.map(aBusStop => {
            return {
                mCoordinates: { mX: aBusStop.stop.geometry.coordinates[0], mY: aBusStop.stop.geometry.coordinates[1] },
                mBusStop: aBusStop,
                mTripDistanceToHere: 0,
            };
        });
    };



    export function GenerateAugmentedGeometry() {
        let lTripDistance = 0;
        cRemainingTripPoints = cFetchedTrip.shape.geometry.coordinates.map((aTripPoint, aIndex, aArray) => {
            const lCurrentPoint = { mX: aTripPoint[0], mY: aTripPoint[1] };
            let lDistanceToPreviousPoint = 0;
            if (aIndex > 0) {
                const lPreviousPoint = { mX: aArray[aIndex - 1][0], mY: aArray[aIndex - 1][1] };
                lDistanceToPreviousPoint = Util.GeoDistance(lPreviousPoint, lCurrentPoint);
                lTripDistance += lDistanceToPreviousPoint;
                // console.log(`Point #${aIndex}`);
                // console.log(`Coords[2]=${aTripPoint[2]}, Dist=${lTripDistance}, Ratio=${Math.abs(lTripDistance / aTripPoint[2])}`);
                // console.log(`DeltaCoords[2]=${aTripPoint[2] - aArray[aIndex - 1][2]}, DeltaDist=${lDistanceToPreviousPoint}, Ratio=${Math.abs(lDistanceToPreviousPoint / (aTripPoint[2] - aArray[aIndex - 1][2]))}`);
            }
            return { mCoordinates: lCurrentPoint, mDrivingInfo: { mTripDistanceToHere: lTripDistance } };
        });
    };


    /*
        export function _GenerateTripStopCorrelations(): void {
            cRemainingBusStops.forEach(aBusStop => {
                const lClosestTripPoint = ClosestTripPoint(cRemainingTripPoints, aBusStop.mCoordinates);
                const lDistanceToBusStop = Util.GeoDistance(lClosestTripPoint.mCoordinates, aBusStop.mCoordinates);
    
                // If closest trip point is too far from bus stop, insert a new one.
                if (lDistanceToBusStop > 5) {
                    let lIndex1 = 0;
                    let lIndex2 = 0;
                    cRemainingTripPoints.forEach((aTripPoint, aIndex, aArray) => {
                        if (aTripPoint === lClosestTripPoint) {
                            lIndex1 = aIndex;
                            lIndex2 = aIndex + 1;
                            if (aIndex == 0) {
    
                            }
                            const lDistanceToPrevious = Util.GeoDistance(aBusStop.mCoordinates, aArray[aIndex - 1])
                        }
                    });
                    const lNewTripPoint: AugmentedTripGeometry = {
                    };
                }
            });
        };*/



    export function GenerateTripStopCorrelations(): void {
        let lTripPointIndex = 0;
        cRemainingBusStops.forEach((aBusStop, aBusStopIndex) => {
            const lLineDistanceFn = Util.PerpendicularDistanceMapper(aBusStop.mCoordinates);
            let lClosestLineStartIndex = 0;
            let lClosestDistance = Infinity;
            let lIndex = lTripPointIndex;
            while (lIndex < cRemainingTripPoints.length - 1) {
                const lLineDistance = lLineDistanceFn(cRemainingTripPoints[lIndex].mCoordinates, cRemainingTripPoints[lIndex + 1].mCoordinates);
                if (lLineDistance < lClosestDistance) {
                    lClosestDistance = lLineDistance;
                    lClosestLineStartIndex = lIndex;
                }
                lIndex++;
            }
            // Insert new point at exact location of bus stop.
            // There often is a point within 1m already, but often there isn't, and we want to simplify things while driving.
            const lDistanceToPreviousPoint = Util.GeoDistance(aBusStop.mCoordinates, cRemainingTripPoints[lClosestLineStartIndex].mCoordinates);
            const lDistanceToNextPoint = Util.GeoDistance(aBusStop.mCoordinates, cRemainingTripPoints[lClosestLineStartIndex + 1].mCoordinates);
            const lDistanceToHere = cRemainingTripPoints[lClosestLineStartIndex].mDrivingInfo.mTripDistanceToHere + lDistanceToPreviousPoint;
            aBusStop.mTripDistanceToHere = lDistanceToHere;
            console.log(`BusStop #${aBusStopIndex}: ${aBusStop.mBusStop.stop.stop_name}, Line distance: ${lClosestDistance}`);
            console.log(`Distance to point #${lClosestLineStartIndex}: ${lDistanceToPreviousPoint}`)
            console.log(`Distance to point #${lClosestLineStartIndex + 1}: ${lDistanceToNextPoint}`)
            cRemainingTripPoints.splice(lClosestLineStartIndex, 0, { mCoordinates: aBusStop.mCoordinates, mDrivingInfo: { mTripDistanceToHere: lDistanceToHere, mBusStop: aBusStop } });
            lTripPointIndex = lClosestLineStartIndex + 1; // Might be multiple stops along the same original line
        });
    };



    export function StartTrip(): void {
        if (cFetchedTrip) {
            cLastDistanceToTripPoint = Infinity;
            cDistanceTravelled = 0;
            GenerateAugmentedBusStops();
            GenerateAugmentedGeometry();
            GenerateTripStopCorrelations();
            GotoClosestTripPoint();
        }
    };



    export function AdvanceTripPoint(lCurrentCoordinates: Util.Coordinates): void {
        const lDistance = Util.GeoDistance(lCurrentCoordinates, cRemainingTripPoints[0].mCoordinates);
        if (lDistance > cLastDistanceToTripPoint && cRemainingTripPoints.length > 1) {
            const lByeTripPoint = cRemainingTripPoints.shift();
            if (lByeTripPoint?.mDrivingInfo.mBusStop === cRemainingBusStops[0]) {
                cRemainingBusStops.shift();
            }
            cLastDistanceToTripPoint = Util.GeoDistance(lCurrentCoordinates, cRemainingTripPoints[0].mCoordinates);
        } else {
            cLastDistanceToTripPoint = lDistance;
        };
    };



    export function GotoClosestTripPoint(): void {
        const lCurrentCoordinates: Util.Coordinates = { mX: Main.cCurrentPosition.coords.longitude, mY: Main.cCurrentPosition.coords.latitude }
        const lClosestTripPoint = ClosestTripPoint(cRemainingTripPoints, lCurrentCoordinates);
        while (cRemainingTripPoints[0] !== lClosestTripPoint) {
            const lByeTripPoint = cRemainingTripPoints.shift();
            if (lByeTripPoint?.mDrivingInfo.mBusStop === cRemainingBusStops[0]) {
                cRemainingBusStops.shift();
            }
            cLastDistanceToTripPoint = Util.GeoDistance(lCurrentCoordinates, cRemainingTripPoints[0].mCoordinates);
        }
    };



    export function AdvanceToClosestTripLine(lCurrentCoordinates: Util.Coordinates): void {
        const lLineDistanceFn = Util.PerpendicularDistanceMapper(lCurrentCoordinates);
        let lClosestLineStartIndex = 0;
        let lClosestDistance = Infinity;
        let lTripPointIndex = 0;

        // Find trip line closest to current location
        while (lTripPointIndex < cRemainingTripPoints.length - 1) {
            const lLineDistance = lLineDistanceFn(cRemainingTripPoints[lTripPointIndex].mCoordinates, cRemainingTripPoints[lTripPointIndex + 1].mCoordinates);
            if (lLineDistance < lClosestDistance) {
                lClosestDistance = lLineDistance;
                lClosestLineStartIndex = lTripPointIndex;
            }
            lTripPointIndex++;
        };

        // Remove any points and bus stops ahead of closest line
        while (lClosestLineStartIndex > 0) {
            const lByeTripPoint = cRemainingTripPoints.shift();
            if (lByeTripPoint?.mDrivingInfo.mBusStop === cRemainingBusStops[0]) {
                cRemainingBusStops.shift();
            }
            lClosestLineStartIndex--;
        }
    }



    export function Update() {
        const lCurrentTime = Main.CurrentTime();
        const lBusNumber = cFetchedRoute?.route_short_name || "999";
        const lTripHeadsign = cFetchedTrip?.trip_headsign || "No Service";
        Main.SetHeadsign("BusHeadsign", lBusNumber, lTripHeadsign, lCurrentTime);

        if (cFetchedTrip) {
            const lCurrentLocation = Main.cCurrentPosition.coords;
            const lCurrentCoordinates: Util.Coordinates = { mX: lCurrentLocation.longitude, mY: lCurrentLocation.latitude };
            AdvanceTripPoint(lCurrentCoordinates);
            cDistanceTravelled = cRemainingTripPoints[0].mDrivingInfo.mTripDistanceToHere - cLastDistanceToTripPoint;
            const lRelevantBusStops = RelevantBusStops();
            //!@#TODO: Ensure lCurrentTime is timestamp of lCurrentCoordinates from GeoLocation:
            const lUpcomingStopsTableValues = UpcomingStopsTableValues(lCurrentCoordinates, lCurrentTime, lRelevantBusStops);

            // Populate the bus stops table.
            const lTableHeaders = ["Time", "T", "Name", "Distance", "AvgSpeed", "AdjSpeed"];
            UI.PopulateTable("UpcomingStopsTable", lUpcomingStopsTableValues, lTableHeaders, true);

            DrawSpeedometer();
        }
    };



    export function DrawSpeedometer(): void {
        const lSpeed = (Main.cCurrentPosition.coords.speed || 0) * 3.6;
        DrawPips();
        DrawCurrentSpeed(lSpeed);
        DrawSpeedMarker(lSpeed, 7, "#90EE90", "CurrentSpeedMarker");
        DrawSpeedMarker(cMaxSpeed, 5, "red", "MaxSpeedMarker");
        DrawSpeedMarker(cExactSpeed, 5, "green", "ExactSpeedMarker");
        DrawSpeedMarker(cMinSpeed, 5, "yellow", "MinSpeedMarker");
    };



    export function DrawPips() {
        const lSvgElement = document.getElementById("SpeedBar");
        for (let lSpeedPip = 0; lSpeedPip <= 100; lSpeedPip += 10) {
            const lPositionX = (lSpeedPip / 100) * 1000;
            const lLineElement = document.createElementNS("http://www.w3.org/2000/svg", "line");
            lLineElement.setAttribute("x1", lPositionX.toString());
            lLineElement.setAttribute("y1", "0");
            lLineElement.setAttribute("x2", lPositionX.toString());
            lLineElement.setAttribute("y2", "30");
            lLineElement.setAttribute("stroke", "black");
            lSvgElement?.appendChild(lLineElement);
        }
    };



    export function DrawCurrentSpeed(aCurrentSpeed: number): void {
        const lSvgElement = document.getElementById("SpeedBar");
        const lPositionX = (aCurrentSpeed / 100) * 1000;

        const lExistingIndicator = document.getElementById("SpeedIndicator");
        if (lExistingIndicator) lSvgElement?.removeChild(lExistingIndicator);

        const lRectangleElement = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        lRectangleElement.setAttribute("id", "SpeedIndicator");
        lRectangleElement.setAttribute("x", "0");
        lRectangleElement.setAttribute("y", "5");
        lRectangleElement.setAttribute("rx", "5");
        lRectangleElement.setAttribute("ry", "5");
        lRectangleElement.setAttribute("width", lPositionX.toString());
        lRectangleElement.setAttribute("height", "20");
        lRectangleElement.setAttribute("fill", "#90EE90");
        lSvgElement?.appendChild(lRectangleElement);
    };



    export function DrawSpeedMarker(aSpeed: number, aWidth: number, aColor: string, aID: string): void {
        const lSvgElement = document.getElementById("SpeedBar");
        const lPositionX = (aSpeed / 100) * 1000 - Math.floor(aWidth / 2);
        const lRectangleElement = document.createElementNS("http://www.w3.org/2000/svg", "rect");

        const lExistingMarker = document.getElementById(aID);
        if (lExistingMarker) lSvgElement?.removeChild(lExistingMarker);

        lRectangleElement.setAttribute("id", aID);
        lRectangleElement.setAttribute("x", lPositionX.toString());
        lRectangleElement.setAttribute("y", "0");
        lRectangleElement.setAttribute("width", aWidth.toString());
        lRectangleElement.setAttribute("height", "30");
        lRectangleElement.setAttribute("fill", aColor);
        // lRectangleElement.setAttribute("fill", "none");
        // lRectangleElement.setAttribute("stroke", aColor);
        // lRectangleElement.setAttribute("stroke-width", "1");
        lSvgElement?.appendChild(lRectangleElement);
    };
};



namespace Main {

    export const cUserSettings: Record<string, string> = {
        TransitLandAPIKey: '',
        OperatorID: '',
        AtBusStopRange: '25',
        BusStopDelaySeconds: '30',
        DestinationFilter: '', // Comma-separated list of partial headsign matches for filtering routes
        DepartureMaxLead: '-15', // How early you're allowed to leave a timepoint
        DepartureMaxDelay: '60', // How late you're allowed to leave a timepoint
        NewTripSearchStartTimeOffset: '-14',
        NewTripSearchStartTimeRange: '58',
    };

    export let cGeolocationWatchID: number;
    export let cDestinationFilter: string[];
    export let cCurrentPosition: GeolocationPosition;
    export let cRealStartTime = new Date();
    export let cSimulatedStartTime = cRealStartTime;



    export function CurrentTime(): Date {
        const lNow = new Date();
        const lElapsedTime = lNow.getTime() - cRealStartTime.getTime();
        const lSimulatedNow = Util.DatePlusMilliSeconds(cSimulatedStartTime, lElapsedTime);
        return lSimulatedNow;
        // return lNow
    };



    export function SimulatedTimeSync(aRealTime: Date, aSimulatedTime: Date): void {
        cRealStartTime = aRealTime;
        cSimulatedStartTime = aSimulatedTime;
    };



    export function TransitLand() {
        const lApiKey = cUserSettings.TransitLandAPIKey.trim();

        if (lApiKey) {
            return TransitLandAPIClient.Client(lApiKey);
        }
    };



    export function ProcessUserSettings(): void {
        cDestinationFilter = cUserSettings.DestinationFilter.split(',').map(aDestination => aDestination.trim());
    };



    export function SetHeadsign(aElementID: string, aBusNumber: string, aTripHeadsign: string, aCurrentTime: Date): void {
        const lBusHeadsignField = document.getElementById(aElementID) as HTMLParagraphElement;
        const lHeadsign = `${aBusNumber}: ${aTripHeadsign}`;
        const lDateString = `${Util.DateString(aCurrentTime)} ${Util.TimeString(aCurrentTime)}`;
        lBusHeadsignField.innerHTML = `${lHeadsign} | ${lDateString} | Punctuality: ${DrivingUI.cPunctualityString}`;
    };



    export let cPositionUpdateCounter = 0;

    export function StartGeolocationWatch(): void {
        if (cGeolocationWatchID) {
            navigator.geolocation.clearWatch(cGeolocationWatchID);
        }

        function PositionWatch(aPosition: GeolocationPosition) {
            cPositionUpdateCounter++;
            cCurrentPosition = aPosition;
            const lGeolocationField = document.getElementById("GeolocationValues") as HTMLParagraphElement;
            const lCoordinates = cCurrentPosition.coords;
            const lCoordinatesString = `Lat: ${lCoordinates.latitude}, Lon: ${lCoordinates.longitude}, Alt: ${lCoordinates.altitude || "-"}m`;
            const lSpeed = Math.round((lCoordinates.speed || 0) * 3.6 * 100) / 100; // Converted from m/s to km/h
            const lHeading = Math.round((lCoordinates.heading || 0) * 100) / 100;
            const lDerivativesString = `Spd: ${lSpeed}km/h, Heading: ${lHeading}deg`;
            const lAccuracyString = `Acc: ${lCoordinates.accuracy || "-"}m, AltAcc: ${lCoordinates.altitudeAccuracy || "-"}m`;
            const lGeolocationTimestampString = `${Util.TimeString(new Date(cCurrentPosition.timestamp))}`;
            lGeolocationField.innerHTML = `${lCoordinatesString} | ${lDerivativesString}<br>${lAccuracyString} (${lGeolocationTimestampString} - ${cPositionUpdateCounter})`;
            DrivingUI.Update();
        };

        function GeolocationWatchError(aError: GeolocationPositionError): void {
            console.log("Geolocation Error: ", aError.code, aError.message);
        }

        cGeolocationWatchID = navigator.geolocation.watchPosition(PositionWatch, GeolocationWatchError, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
        });
    }



    export function ResetGPS(): void {
        console.log("Reset GPS button pressed...");
        StartGeolocationWatch();
    };



    window.onload = () => {
        UI.ShowPanel('DrivingPanel');
        SettingsUI.LoadSettingsFromStorage();
        SettingsUI.PopulateSettingsTable();

        const lEndTimeInput = document.getElementById('TripSearchMinutes') as HTMLInputElement;
        lEndTimeInput.value = cUserSettings.NewTripSearchStartTimeRange;
        StartGeolocationWatch();
    };
};
