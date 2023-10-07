
namespace Util {

    export interface Coordinates {
        mX: number;
        mY: number;
    };



    export interface LocatedObject<T> extends Coordinates {
        mObject: T;
    };



    export function Distance(aPosition1: Coordinates, aPosition2: Coordinates): number {
        const lDeltaX1 = aPosition2.mX - aPosition1.mX;
        const lDeltaY1 = aPosition2.mY - aPosition1.mY;
        return Math.sqrt(lDeltaX1 * lDeltaX1 + lDeltaY1 * lDeltaY1);
    };



    export function DistanceComparator(aOrigin: Coordinates) {
        return (aPosition1: Coordinates, aPosition2: Coordinates): number => {
            return Distance(aOrigin, aPosition1) - Distance(aOrigin, aPosition2);
        };
    };



    export function PerpendicularDistanceMapper(aPoint: Coordinates) {
        return (aLineStart: Coordinates, aLineEnd: Coordinates) => {
            const lSlope = (aLineEnd.mY - aLineStart.mY) / (aLineEnd.mX - aLineStart.mX);
            const lYIntercept = aLineStart.mY - lSlope * aLineStart.mX;
            return Math.abs(lSlope * aPoint.mX - aPoint.mY + lYIntercept) / Math.sqrt(lSlope * lSlope + 1);;
        }
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
                number
            ]
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

        localStorage.setItem('UserSettings', JSON.stringify(Main.cUserSettings));
        CloseSettingsUI();
    };



    export function ButtonCancelSettings(): void {
        PopulateSettingsTable();
        CloseSettingsUI();
    };
};



namespace NewTripUI {

    export async function FetchRoutes(): Promise<void> {
        const lTransitLand = Main.TransitLand();
        const lOperatorID = Main.cUserSettings.OperatorID.trim();

        if (lTransitLand && lOperatorID.length > 0) {
            const lFetchResult = await lTransitLand.FetchedRoutes(lOperatorID);

            if (lFetchResult.mData?.routes) {
                const lFilteredRoutes = lFetchResult.mData.routes
                    .filter(aRoute => +aRoute.route_short_name > 0 && +aRoute.route_short_name < 500)
                    .filter(aRoute => Main.cDestinationFilter.some(aDestination => aRoute.route_long_name.includes(aDestination)));
                lFilteredRoutes.sort((aRoute1, aRoute2) => +aRoute1.route_short_name - +aRoute2.route_short_name);
                DrivingUI.cFetchedRoutes = lFilteredRoutes;
                const lKeyValuePairs = lFilteredRoutes.map(aRoute =>
                    [aRoute.onestop_id, `${aRoute.route_short_name}: ${aRoute.route_long_name}`] as [string, string]
                );
                UI.PopulateDropdown("RouteList", lKeyValuePairs)
            }
        }
        DrivingUI.Update();
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
                lBusStopLocations.sort(Util.DistanceComparator({ mY: lCurrentLatitude, mX: lCurrentLongitude }));
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
        const lDateString = Util.DateString(lNow);
        const lTimeString = Util.TimeString(lNow);
        const lDateInput = document.getElementById('TripSearchDate') as HTMLInputElement;
        const lStartTimeInput = document.getElementById('TripSearchStart') as HTMLInputElement;
        const lSimulatedTimeInput = document.getElementById('SimulatedTimeStart') as HTMLInputElement;

        // Set the values of the input elements
        lDateInput.value = lDateString;
        lStartTimeInput.value = lTimeString;
        lSimulatedTimeInput.value = lTimeString;

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

    export let cFetchedRoutes: TransitLandAPIClient.Route[];
    export let cFetchedRoute: TransitLandAPIClient.Route;
    export let cFetchedDepartures: TransitLandAPIClient.Departure[];
    export let cFetchedTrip: TransitLandAPIClient.Trip;
    export let cRemainingBusStops: Util.LocatedObject<TransitLandAPIClient.BusStopWithTime>[];
    export let cPreviousDistanceToNextStop = 999999;



    export function AdvanceToClosestStop(aCurrentGeoLocation: GeolocationCoordinates): void {
        const lCurrentLocation = { mY: aCurrentGeoLocation.latitude, mX: aCurrentGeoLocation.longitude }
        const lDistanceComparator = Util.DistanceComparator(lCurrentLocation);

        while (cRemainingBusStops?.length > 1) {
            const lStopCoordinates0 = cRemainingBusStops[0].mObject.stop.geometry.coordinates;
            const lStopCoordinates1 = cRemainingBusStops[1].mObject.stop.geometry.coordinates;
            const lStopLocation0: Util.Coordinates = { mX: lStopCoordinates0[0], mY: lStopCoordinates0[1] };
            const lStopLocation1: Util.Coordinates = { mX: lStopCoordinates1[0], mY: lStopCoordinates1[1] };
            const lDeltaDistance = lDistanceComparator(lStopLocation0, lStopLocation1);

            if (lDeltaDistance > 0) {
                const lByeStop = cRemainingBusStops.shift();
                const lCurrentLocationString = JSON.stringify(lCurrentLocation);
                const lStopLocation0String = JSON.stringify(lStopLocation0);
                const lStopLocation1String = JSON.stringify(lStopLocation1);
                console.log(`${lByeStop?.mObject.stop.stop_name}: ${lCurrentLocationString} - ${lStopLocation0String} = ${Util.Distance(lCurrentLocation, lStopLocation0)}`);
                console.log(`   ${cRemainingBusStops[0].mObject.stop.stop_name}: ${lCurrentLocationString} - ${lStopLocation1String} = ${Util.Distance(lCurrentLocation, lStopLocation1)}`);
            } else {
                break;
            }
        }
    };



    export function StartTrip(): void {
        if (cFetchedTrip) {
            cRemainingBusStops = cFetchedTrip.stop_times.map(aBusStop =>
                ({ mX: aBusStop.stop.geometry.coordinates[0], mY: aBusStop.stop.geometry.coordinates[1], mObject: aBusStop } as Util.LocatedObject<TransitLandAPIClient.BusStopWithTime>)
            );
        }
        AdvanceToClosestStop(Main.cCurrentPosition.coords);
    };



    export function Update() {
        const lCurrentTime = Main.CurrentTime();
        const lBusNumber = cFetchedRoute?.route_short_name || "999";
        const lTripHeadsign = cFetchedTrip?.trip_headsign || "No Service";
        Main.SetHeadsign("BusHeadsign", lBusNumber, lTripHeadsign, lCurrentTime);

        if (cFetchedTrip) {
            const lLocation = Main.cCurrentPosition.coords;
            const lCoordinates: Util.Coordinates = { mY: lLocation.latitude, mX: lLocation.longitude };
            const lLocationTime = new Date(Main.cCurrentPosition.timestamp);
            const lTrip = cFetchedTrip;

            // If distance to bus stop is increasing, assume that we've passed it.
            let lDistanceToNextStop = Util.Distance(lCoordinates, cRemainingBusStops[0]);
            if (lDistanceToNextStop > cPreviousDistanceToNextStop) {
                if (cRemainingBusStops.length > 1) { // Don't remove the final stop.
                    cRemainingBusStops.shift();
                }
                lDistanceToNextStop = Util.Distance(lCoordinates, cRemainingBusStops[0]);
            }

            // Isolate all stops that will appear on Driving UI.
            const lRelevantStops = [cRemainingBusStops[0]];
            if (cRemainingBusStops.length > 1) lRelevantStops.push(cRemainingBusStops[1]);
            if (cRemainingBusStops.length > 2) lRelevantStops.push(cRemainingBusStops[2]);
            if (cRemainingBusStops.length > 3) {
                // Add the next timepoint.
                let lIndex = 3;
                while (lIndex < cRemainingBusStops.length) {
                    if (cRemainingBusStops[lIndex].mObject.timepoint === 1) {
                        lRelevantStops.push(cRemainingBusStops[lIndex]);
                        break;
                    }
                    lIndex++;
                }
                // Add the final stop.
                lRelevantStops.push(cRemainingBusStops[cRemainingBusStops.length - 1]);
            };

            // Generate the bus stops table.
            const lTableHeaders = ["Time", "T", "Name", "AvgSpeed", "AdjSpeed", "ETA"];
            // const lTableValues: Record<string, string>[] = [];
            let lCountdown = 0; // MM:SS
            let lAvgSpeedMin = 15; // Average Km/h at max allowed delay
            let lAvgSpeedMax = 85; // Average Km/h at max allowed lead time
            let lAdjSpeedMin = 20; // Average min speed adjusted for historic recorded speeds/delays on trip/route
            let lAdjSpeedMax = 80; // Average max speed adjusted for historic recorded speeds/delays on trip/route
            let lDeltaETA = 0; // MM:SS
            let lDelay = 0; // MM:SS
            const lUpcomingStopsTableValues = lRelevantStops.map(aBusStop => ({
                Time: `${aBusStop.mObject.departure_time} (${lCountdown})`,
                T: aBusStop.mObject.timepoint > 0 ? "T" : "",
                Name: aBusStop.mObject.stop.stop_name,
                AvgSpeed: `${lAvgSpeedMin} - ${lAvgSpeedMax}`,
                AdjSpeed: `${lAdjSpeedMin} - ${lAdjSpeedMax}`,
                ETA: `${lDeltaETA} (${lDelay})`,
            }));

            // const lFinalDestinationSpacerRow = { Time: "<span class='small-ui'>Final Destination:</span>", T: "---", Name: "---", AvgSpeed: "---", AdjSpeed: "---", ETA: "---" };
            // const lTimepointSpacerRow = { Time: "<span class='small-ui'>Next Timepoint:</span>", T: "---", Name: "---", AvgSpeed: "---", AdjSpeed: "---", ETA: "---" };
            // const lTimepointAbsentRow = { Time: "", T: "", Name: "", AvgSpeed: "", AdjSpeed: "", ETA: "" };
            const lSpacerRow = { Time: "<span class='small-ui'>Next Timepoint & Final Destination:</span>", T: "---", Name: "---", AvgSpeed: "---", AdjSpeed: "---", ETA: "---" };
            lUpcomingStopsTableValues.splice(3, 0, lSpacerRow);
            UI.PopulateTable("UpcomingStopsTable", lUpcomingStopsTableValues, lTableHeaders, true);

            cPreviousDistanceToNextStop = lDistanceToNextStop;
        }
    };
};



namespace Main {

    export const cUserSettings: Record<string, string> = {
        TransitLandAPIKey: '',
        OperatorID: '',
        BusStopDelaySeconds: '30',
        DestinationFilter: '', // Comma-separated list of partial headsign matches.
    };

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



    export function SetHeadsign(aElementID: string, aBusNumber: string, aTripHeadsign: string, aCurrentTime: Date): void {
        const lBusHeadsignField = document.getElementById(aElementID) as HTMLParagraphElement;
        lBusHeadsignField.innerHTML = `${aBusNumber}: ${aTripHeadsign} | ${Util.DateString(aCurrentTime)} ${Util.TimeString(aCurrentTime)}`;
    };



    export let cPositionUpdateCounter = 0;
    export function PositionWatch(aPosition: GeolocationPosition) {
        const lCoordinate = aPosition.coords;
        const lCoordinateSpan = document.getElementById('CoordinateSpan') as HTMLSpanElement;
        cPositionUpdateCounter++;
        lCoordinateSpan.textContent = `Lat: ${lCoordinate.latitude}, Lon: ${lCoordinate.longitude} (${new Date(aPosition.timestamp).toLocaleString()} - ${cPositionUpdateCounter})`;
        cCurrentPosition = aPosition;
        DrivingUI.Update();
    };



    window.onload = () => {
        UI.ShowPanel('DrivingPanel');
        SettingsUI.LoadSettingsFromStorage();
        SettingsUI.PopulateSettingsTable();

        const lEndTimeInput = document.getElementById('TripSearchMinutes') as HTMLInputElement;
        lEndTimeInput.value = "60";

        const lWatchID = navigator.geolocation.watchPosition(PositionWatch);
    };
};
