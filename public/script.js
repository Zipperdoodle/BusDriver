"use strict";
var Util;
(function (Util) {
    ;
    ;
    // aOrigin = closest trip point, aFrom = preceding trip point, aTo = Bus stop
    // If the resulting angle <90 degrees, then the bus stop is ahead of the closest trip point,
    // and the distance between them needs to be subtracted from the total travel distance to the stop,
    // else the closest point is ahead of the stop and the distance to the stop needs to be added.
    function Angle(aOrigin, aFrom, aTo) {
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
    }
    Util.Angle = Angle;
    ;
    function GeoDistance(aPoint1, aPoint2) {
        // Calculates the distance in meters between two latitude/longitude geolocation coordinates.
        // X (vertical) is longitude, Y (vertical) is latitude.
        // This uses an improved euclidian approach that works well over relatively short distances.
        const lDeltaLatitude = aPoint2.mY - aPoint1.mY;
        const lDeltaLongitude = aPoint2.mX - aPoint1.mX;
        const lAverageLatitude = (aPoint1.mY + aPoint2.mY) / 2;
        // Convert degrees to meters according to earth's polar and equatorial circumference,
        // adjusting longitude scale according to latitude.
        const lEarthPolarCircumference = 40007863;
        const lEarthEquatorialCircumference = 40075017;
        const lDeltaY = lDeltaLatitude * (lEarthPolarCircumference / 360);
        const lDeltaX = lDeltaLongitude * (lEarthEquatorialCircumference / 360) * Math.cos(lAverageLatitude * Math.PI / 180);
        const lDistance = Math.sqrt(lDeltaX * lDeltaX + lDeltaY + lDeltaY);
        return lDistance;
    }
    Util.GeoDistance = GeoDistance;
    ;
    function CartesianDistance(aPoint1, aPoint2) {
        const lDeltaX1 = aPoint2.mX - aPoint1.mX;
        const lDeltaY1 = aPoint2.mY - aPoint1.mY;
        return Math.sqrt(lDeltaX1 * lDeltaX1 + lDeltaY1 * lDeltaY1);
    }
    Util.CartesianDistance = CartesianDistance;
    ;
    function DistanceComparator(aOrigin, aDistanceFunction) {
        return (aPosition1, aPosition2) => {
            return aDistanceFunction(aOrigin, aPosition1) - aDistanceFunction(aOrigin, aPosition2);
        };
    }
    Util.DistanceComparator = DistanceComparator;
    ;
    function PerpendicularDistanceMapper(aPoint) {
        return (aLineStart, aLineEnd) => {
            const lSlope = (aLineEnd.mY - aLineStart.mY) / (aLineEnd.mX - aLineStart.mX);
            const lYIntercept = aLineStart.mY - lSlope * aLineStart.mX;
            return Math.abs(lSlope * aPoint.mX - aPoint.mY + lYIntercept) / Math.sqrt(lSlope * lSlope + 1);
            ;
        };
    }
    Util.PerpendicularDistanceMapper = PerpendicularDistanceMapper;
    function DeltaTime(aDate1, aDate2) {
        return aDate2.getTime() - aDate1.getTime();
    }
    Util.DeltaTime = DeltaTime;
    ;
    function DurationString(aMilliSeconds) {
        const lAbsDeltaMilliseconds = Math.abs(aMilliSeconds);
        const lHours = Math.floor(lAbsDeltaMilliseconds / (1000 * 60 * 60));
        const lMinutes = Math.floor((lAbsDeltaMilliseconds % (1000 * 60 * 60)) / (1000 * 60));
        const lSeconds = Math.floor((lAbsDeltaMilliseconds % (1000 * 60)) / 1000);
        const lFormattedHours = lHours.toString().padStart(2, '0');
        const lFormattedMinutes = lMinutes.toString().padStart(2, '0');
        const lFormattedSeconds = lSeconds.toString().padStart(2, '0');
        const lSign = aMilliSeconds < 0 ? '-' : '+';
        return `${lSign}${lFormattedHours}:${lFormattedMinutes}:${lFormattedSeconds}`;
    }
    Util.DurationString = DurationString;
    function DatePlusMilliSeconds(aDate, aMilliSeconds) {
        return new Date(aDate.getTime() + aMilliSeconds);
    }
    Util.DatePlusMilliSeconds = DatePlusMilliSeconds;
    ;
    function DateFromStrings(aDateString, aTimeString) {
        return new Date(`${aDateString}T${aTimeString}`);
    }
    Util.DateFromStrings = DateFromStrings;
    ;
    function DateString(aDate) {
        return `${aDate.getFullYear()}-${(aDate.getMonth() + 1).toString().padStart(2, '0')}-${aDate.getDate().toString().padStart(2, '0')}`;
    }
    Util.DateString = DateString;
    ;
    function TimeString(aDate) {
        return `${aDate.getHours().toString().padStart(2, '0')}:${aDate.getMinutes().toString().padStart(2, '0')}:${aDate.getSeconds().toString().padStart(2, '0')}`;
    }
    Util.TimeString = TimeString;
    ;
})(Util || (Util = {}));
;
var Fetch;
(function (Fetch) {
    function UrlQueryString(aApiEndpoint, aQueryParams) {
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
    }
    Fetch.UrlQueryString = UrlQueryString;
    ;
    async function FetchedData(aApiEndpoint, aHeaders, aQueryParams) {
        try {
            const lUrlQueryString = UrlQueryString(aApiEndpoint, aQueryParams);
            console.log(`Fetching: ${lUrlQueryString}`);
            const lHeaders = { 'Content-Type': 'application/json', ...aHeaders };
            const lResponse = await fetch(lUrlQueryString, { method: 'GET', headers: lHeaders });
            const lData = await lResponse.json();
            console.log(`Fetch Response ${lResponse.status}: ***${JSON.stringify(lData)}***`);
            return { mData: lData, mResponseOk: lResponse.ok, mResponseStatus: lResponse.status, mErrorMessage: `Received status code ${lResponse.status}` };
        }
        catch (aError) {
            const lErrorMessage = aError.message;
            console.log(`Fetch Error: ${lErrorMessage}`);
            return { mResponseOk: false, mResponseStatus: -1, mErrorMessage: lErrorMessage };
        }
    }
    Fetch.FetchedData = FetchedData;
    ;
})(Fetch || (Fetch = {}));
;
var TransitLandAPIClient;
(function (TransitLandAPIClient) {
    TransitLandAPIClient.cDefaultAPIBase = "https://transit.land/api/v2/rest";
    async function FetchedTransitLandDataPage(aApiKey, aApiEndpoint, aQueryParams) {
        const lHeaders = { 'Content-Type': 'application/json', 'apikey': aApiKey };
        const lResponse = await Fetch.FetchedData(aApiEndpoint, lHeaders, aQueryParams);
        // lResponse.mData = lResponse.mData || {};
        return lResponse;
    }
    TransitLandAPIClient.FetchedTransitLandDataPage = FetchedTransitLandDataPage;
    ;
    async function FetchedTransitLandData(aArrayKey, aApiKey, aApiEndpoint, aQueryParams) {
        var _a, _b, _c;
        const lData = {};
        let lResponse = null;
        let lLinkToNextSet = aApiEndpoint;
        do {
            lResponse = await FetchedTransitLandDataPage(aApiKey, lLinkToNextSet, aQueryParams);
            lData[aArrayKey] = [...(lData[aArrayKey] || []), ...(((_a = lResponse.mData) === null || _a === void 0 ? void 0 : _a[aArrayKey]) || [])]; // Type assertion to make up for failure to infer.
            lLinkToNextSet = (_c = (_b = lResponse.mData) === null || _b === void 0 ? void 0 : _b.meta) === null || _c === void 0 ? void 0 : _c.next;
            aQueryParams = undefined;
        } while (lLinkToNextSet);
        if (lResponse.mData) {
            lResponse.mData[aArrayKey] = lData[aArrayKey];
        }
        return lResponse;
    }
    TransitLandAPIClient.FetchedTransitLandData = FetchedTransitLandData;
    ;
    function Client(aApiKey, aApiBase) {
        const lApiBase = aApiBase || TransitLandAPIClient.cDefaultAPIBase;
        return {
            FetchedOperators: async (aQueryParams) => {
                const lApiEndpoint = `${lApiBase}/operators`;
                return await FetchedTransitLandData("operators", aApiKey, lApiEndpoint, aQueryParams);
            },
            FetchedOperator: async (aOperatorID) => {
                const lApiEndpoint = `${lApiBase}/operators/${aOperatorID}`;
                return await FetchedTransitLandData("operators", aApiKey, lApiEndpoint);
            },
            FetchedRoutes: async (aOperatorID, aQueryParams) => {
                const lApiEndpoint = `${lApiBase}/routes`;
                return await FetchedTransitLandData("routes", aApiKey, lApiEndpoint, { operator_onestop_id: aOperatorID, ...aQueryParams });
            },
            FetchedRoute: async (aRouteID, aQueryParams) => {
                const lApiEndpoint = `${lApiBase}/routes/${aRouteID}`;
                return await FetchedTransitLandData("routes", aApiKey, lApiEndpoint, aQueryParams);
            },
            FetchedTrips: async (aRouteID, aQueryParams) => {
                const lApiEndpoint = `${lApiBase}/routes/${aRouteID}/trips`;
                return await FetchedTransitLandData("trips", aApiKey, lApiEndpoint, aQueryParams);
            },
            FetchedTrip: async (aRouteID, aTripID) => {
                const lApiEndpoint = `${lApiBase}/routes/${aRouteID}/trips/${aTripID}`;
                return await FetchedTransitLandData("trips", aApiKey, lApiEndpoint);
            },
            FetchedBusStops: async (aQueryParams) => {
                const lApiEndpoint = `${lApiBase}/stops`;
                return await FetchedTransitLandData("stops", aApiKey, lApiEndpoint, aQueryParams);
            },
            FetchedBusStop: async (aBusStopID) => {
                const lApiEndpoint = `${lApiBase}/stops/${aBusStopID}`;
                return await FetchedTransitLandData("stops", aApiKey, lApiEndpoint);
            },
            FetchedDepartures: async (aStopID, aQueryParams) => {
                const lApiEndpoint = `${lApiBase}/stops/${aStopID}/departures`;
                return await FetchedTransitLandData("stops", aApiKey, lApiEndpoint, aQueryParams);
            },
        };
    }
    TransitLandAPIClient.Client = Client;
    ;
})(TransitLandAPIClient || (TransitLandAPIClient = {}));
;
var UI;
(function (UI) {
    function ShowPanel(aPanelID) {
        const lPanel = document.getElementById(aPanelID);
        if (lPanel) {
            lPanel.style.display = 'block';
        }
    }
    UI.ShowPanel = ShowPanel;
    ;
    function HidePanel(aPanelID) {
        const lPanel = document.getElementById(aPanelID);
        if (lPanel) {
            lPanel.style.display = 'none';
        }
    }
    UI.HidePanel = HidePanel;
    ;
    function PopulateDropdown(aElementID, aKeyValuePairs) {
        const lDropdown = document.getElementById(aElementID);
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
    UI.PopulateDropdown = PopulateDropdown;
    function PopulateTable(aTableID, aData, aHeaders, aPopulateHeaders = true) {
        const lTable = document.getElementById(aTableID);
        if (lTable) {
            //!@#TODO: Runtime check that lTable is indeed a table element
            lTable.innerHTML = ''; // Clear existing table data
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
    }
    UI.PopulateTable = PopulateTable;
    ;
})(UI || (UI = {}));
;
var SettingsUI;
(function (SettingsUI) {
    function LoadSettingsFromStorage() {
        const lStoredSettings = localStorage.getItem('UserSettings');
        if (lStoredSettings) {
            Object.assign(Main.cUserSettings, JSON.parse(lStoredSettings));
        }
        Main.ProcessUserSettings();
    }
    SettingsUI.LoadSettingsFromStorage = LoadSettingsFromStorage;
    ;
    function PopulateSettingsTable() {
        const lSettingsTable = document.getElementById('SettingsTable');
        lSettingsTable.innerHTML = '';
        Object.entries(Main.cUserSettings).forEach(([aKey, aValue]) => {
            const lRow = lSettingsTable.insertRow();
            lRow.insertCell().textContent = aKey;
            const lValueCell = lRow.insertCell();
            const lInput = document.createElement('input');
            lInput.value = aValue;
            lValueCell.appendChild(lInput);
        });
    }
    SettingsUI.PopulateSettingsTable = PopulateSettingsTable;
    ;
    function OpenSettingsUI() {
        UI.HidePanel('DrivingPanel');
        UI.ShowPanel('SettingsPanel');
    }
    SettingsUI.OpenSettingsUI = OpenSettingsUI;
    ;
    function CloseSettingsUI() {
        DrivingUI.Update();
        UI.HidePanel('SettingsPanel');
        UI.ShowPanel('DrivingPanel');
    }
    SettingsUI.CloseSettingsUI = CloseSettingsUI;
    ;
    function ButtonSaveSettings() {
        const lSettingsTable = document.getElementById('SettingsTable');
        Array.from(lSettingsTable.rows).forEach(aRow => {
            const lKey = aRow.cells[0].textContent;
            const lValue = aRow.cells[1].firstChild.value;
            if (lKey) {
                Main.cUserSettings[lKey] = lValue;
            }
        });
        Main.ProcessUserSettings();
        localStorage.setItem('UserSettings', JSON.stringify(Main.cUserSettings));
        CloseSettingsUI();
    }
    SettingsUI.ButtonSaveSettings = ButtonSaveSettings;
    ;
    function ButtonCancelSettings() {
        PopulateSettingsTable();
        CloseSettingsUI();
    }
    SettingsUI.ButtonCancelSettings = ButtonCancelSettings;
    ;
})(SettingsUI || (SettingsUI = {}));
;
var NewTripUI;
(function (NewTripUI) {
    function PopulateRoutes() {
        const lOperatorID = Main.cUserSettings.OperatorID.trim();
        if (lOperatorID.length > 0) {
            const lRoutesJSON = localStorage.getItem(`RouteList_${lOperatorID}`);
            if (lRoutesJSON) {
                const lRoutes = JSON.parse(lRoutesJSON);
                const lFilteredRoutes = lRoutes
                    .filter(aRoute => +aRoute.route_short_name > 0 && +aRoute.route_short_name < 500)
                    .filter(aRoute => Main.cDestinationFilter.some(aDestination => aRoute.route_long_name.includes(aDestination)));
                lFilteredRoutes.sort((aRoute1, aRoute2) => +aRoute1.route_short_name - +aRoute2.route_short_name);
                DrivingUI.cFetchedRoutes = lFilteredRoutes;
                const lKeyValuePairs = lFilteredRoutes.map(aRoute => [aRoute.onestop_id, `${aRoute.route_short_name}: ${aRoute.route_long_name}`]);
                UI.PopulateDropdown("RouteList", lKeyValuePairs);
                DrivingUI.Update();
            }
        }
    }
    NewTripUI.PopulateRoutes = PopulateRoutes;
    ;
    async function FetchRoutes() {
        var _a;
        const lTransitLand = Main.TransitLand();
        const lOperatorID = Main.cUserSettings.OperatorID.trim();
        if (lTransitLand && lOperatorID.length > 0) {
            const lFetchResult = await lTransitLand.FetchedRoutes(lOperatorID);
            if ((_a = lFetchResult.mData) === null || _a === void 0 ? void 0 : _a.routes) {
                localStorage.setItem(`RouteList_${lOperatorID}`, JSON.stringify(lFetchResult.mData.routes));
                PopulateRoutes();
            }
        }
    }
    NewTripUI.FetchRoutes = FetchRoutes;
    ;
    async function FetchBusStops() {
        var _a, _b;
        const lTransitLand = Main.TransitLand();
        const lRouteList = document.getElementById('RouteList');
        const lRouteIndex = lRouteList.selectedIndex;
        if (Main.cCurrentPosition && lTransitLand && lRouteIndex >= 0) {
            const lCurrentLatitude = Main.cCurrentPosition.coords.latitude;
            const lCurrentLongitude = Main.cCurrentPosition.coords.longitude;
            const lRouteSubset = DrivingUI.cFetchedRoutes[lRouteIndex];
            const lFetchResult = await lTransitLand.FetchedRoute(lRouteSubset.onestop_id);
            if ((_a = lFetchResult.mData) === null || _a === void 0 ? void 0 : _a.routes) {
                const lRoute = (_b = lFetchResult.mData) === null || _b === void 0 ? void 0 : _b.routes[0];
                const lBusStopLocations = lRoute.route_stops.map(aBusStop => ({ mX: aBusStop.stop.geometry.coordinates[0], mY: aBusStop.stop.geometry.coordinates[1], mObject: aBusStop.stop }));
                lBusStopLocations.sort(Util.DistanceComparator({ mY: lCurrentLatitude, mX: lCurrentLongitude }, Util.GeoDistance));
                const lKeyValuePairs = lBusStopLocations.map(aBusStopLocation => [aBusStopLocation.mObject.id.toString(), `[${aBusStopLocation.mObject.stop_id}] ${aBusStopLocation.mObject.stop_name}`]);
                UI.PopulateDropdown("BusStopList", lKeyValuePairs);
                DrivingUI.cFetchedRoute = lRoute;
            }
        }
        DrivingUI.Update();
    }
    NewTripUI.FetchBusStops = FetchBusStops;
    ;
    function TripListChanged() {
        const lTripList = document.getElementById('TripList');
        const lTripIndex = lTripList.selectedIndex;
        if (lTripIndex >= 0) {
            const lDeparture = DrivingUI.cFetchedDepartures[lTripIndex];
            const lTripStartTime = lDeparture.departure_time;
            const lSimulatedTimeInput = document.getElementById('SimulatedTimeStart');
            lSimulatedTimeInput.value = lTripStartTime;
        }
    }
    NewTripUI.TripListChanged = TripListChanged;
    ;
    async function FetchTrips() {
        var _a, _b;
        const lTransitLand = Main.TransitLand();
        const lBusStopList = document.getElementById('BusStopList');
        const lBusStopID = lBusStopList.value;
        if (DrivingUI.cFetchedRoute && lTransitLand && lBusStopID) {
            const lDateInput = document.getElementById('TripSearchDate');
            const lStartTimeInput = document.getElementById('TripSearchStart');
            const lMinutesInput = document.getElementById('TripSearchMinutes');
            const lStartTime = Util.DateFromStrings(lDateInput.value, lStartTimeInput.value);
            const lEndTime = Util.DatePlusMilliSeconds(lStartTime, +lMinutesInput.value * 60 * 1000);
            const lQueryParams = {
                service_date: lDateInput.value,
                start_time: lStartTimeInput.value,
                end_time: Util.TimeString(lEndTime)
            };
            console.log(lQueryParams);
            const lFetchResult = await lTransitLand.FetchedDepartures(lBusStopID, lQueryParams);
            if ((_a = lFetchResult.mData) === null || _a === void 0 ? void 0 : _a.stops) {
                const lDepartures = (_b = lFetchResult.mData) === null || _b === void 0 ? void 0 : _b.stops[0].departures;
                if (lDepartures) {
                    const lKeyValuePairs = lDepartures.map(aDeparture => { var _a; return [aDeparture.trip.id.toString(), `[${aDeparture.departure_time}] ${(_a = aDeparture.trip.route) === null || _a === void 0 ? void 0 : _a.route_short_name}: ${aDeparture.trip.trip_headsign}`]; });
                    UI.PopulateDropdown("TripList", lKeyValuePairs || []);
                    DrivingUI.cFetchedDepartures = lDepartures;
                    TripListChanged();
                }
            }
        }
        DrivingUI.Update();
    }
    NewTripUI.FetchTrips = FetchTrips;
    ;
    function TripSearchStartChanged() {
        console.log("TripSearchStartChanged");
        const lStartTimeInput = document.getElementById('TripSearchStart');
        const lSimulatedTimeInput = document.getElementById('SimulatedTimeStart');
        lSimulatedTimeInput.value = lStartTimeInput.value;
        DrivingUI.Update();
    }
    NewTripUI.TripSearchStartChanged = TripSearchStartChanged;
    ;
    function OpenNewTripUI() {
        const lNow = Main.CurrentTime();
        const lDateString = Util.DateString(lNow);
        const lTimeString = Util.TimeString(lNow);
        const lDateInput = document.getElementById('TripSearchDate');
        const lStartTimeInput = document.getElementById('TripSearchStart');
        const lSimulatedTimeInput = document.getElementById('SimulatedTimeStart');
        // Set the values of the input elements
        lDateInput.value = lDateString;
        lStartTimeInput.value = lTimeString;
        lSimulatedTimeInput.value = lTimeString;
        PopulateRoutes();
        UI.HidePanel('DrivingPanel');
        UI.ShowPanel('NewTripPanel');
        DrivingUI.Update();
    }
    NewTripUI.OpenNewTripUI = OpenNewTripUI;
    ;
    function CloseNewTripUI() {
        DrivingUI.Update();
        UI.HidePanel('NewTripPanel');
        UI.ShowPanel('DrivingPanel');
    }
    NewTripUI.CloseNewTripUI = CloseNewTripUI;
    ;
    async function ButtonStartNewTrip() {
        var _a, _b, _c;
        const lTransitLand = Main.TransitLand();
        const lTripList = document.getElementById('TripList');
        const lTripIndex = lTripList.selectedIndex;
        if (lTransitLand && lTripIndex >= 0) {
            const lDeparture = DrivingUI.cFetchedDepartures[lTripIndex];
            const lTripID = lDeparture.trip.id;
            const lRouteID = (_a = lDeparture.trip.route) === null || _a === void 0 ? void 0 : _a.onestop_id;
            if (lRouteID && ((_b = DrivingUI.cFetchedTrip) === null || _b === void 0 ? void 0 : _b.id) != lTripID) {
                const lFetchResult = await lTransitLand.FetchedTrip(lRouteID, lTripID.toString());
                if ((_c = lFetchResult.mData) === null || _c === void 0 ? void 0 : _c.trips) {
                    DrivingUI.cFetchedTrip = lFetchResult.mData.trips[0];
                }
            }
        }
        DrivingUI.StartTrip();
        CloseNewTripUI();
    }
    NewTripUI.ButtonStartNewTrip = ButtonStartNewTrip;
    ;
    function ButtonCancelNewTrip() {
        CloseNewTripUI();
    }
    NewTripUI.ButtonCancelNewTrip = ButtonCancelNewTrip;
    ;
    function ButtonSetCurrentTime() {
        const lNow = new Date();
        Main.SimulatedTimeSync(lNow, lNow);
        DrivingUI.Update();
    }
    NewTripUI.ButtonSetCurrentTime = ButtonSetCurrentTime;
    ;
    function ButtonSetSimulatedTime() {
        const lDateInput = document.getElementById('TripSearchDate');
        const lTripList = document.getElementById('TripList');
        const lSimulatedTimeInput = document.getElementById('SimulatedTimeStart');
        Main.SimulatedTimeSync(new Date(), Util.DateFromStrings(lDateInput.value, lSimulatedTimeInput.value));
        DrivingUI.Update();
    }
    NewTripUI.ButtonSetSimulatedTime = ButtonSetSimulatedTime;
    ;
})(NewTripUI || (NewTripUI = {}));
;
var DrivingUI;
(function (DrivingUI) {
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
    function AdvanceToClosestStop(aCurrentGeoLocation) {
        const lCurrentLocation = { mY: aCurrentGeoLocation.latitude, mX: aCurrentGeoLocation.longitude };
        const lDistanceComparator = Util.DistanceComparator(lCurrentLocation, Util.GeoDistance);
        while ((DrivingUI.cRemainingBusStops === null || DrivingUI.cRemainingBusStops === void 0 ? void 0 : DrivingUI.cRemainingBusStops.length) > 1) {
            const lStopCoordinates0 = DrivingUI.cRemainingBusStops[0].mBusStop.stop.geometry.coordinates;
            const lStopCoordinates1 = DrivingUI.cRemainingBusStops[1].mBusStop.stop.geometry.coordinates;
            const lStopLocation0 = { mX: lStopCoordinates0[0], mY: lStopCoordinates0[1] };
            const lStopLocation1 = { mX: lStopCoordinates1[0], mY: lStopCoordinates1[1] };
            const lDeltaDistance = lDistanceComparator(lStopLocation0, lStopLocation1);
            if (lDeltaDistance > 0) {
                const lByeStop = DrivingUI.cRemainingBusStops.shift();
                console.log(`Skipping ${lByeStop === null || lByeStop === void 0 ? void 0 : lByeStop.mBusStop.stop.stop_name} at distance ${Util.GeoDistance(lCurrentLocation, lStopLocation0)}`);
                console.log(`   in favor of ${DrivingUI.cRemainingBusStops[0].mBusStop.stop.stop_name} at distance ${Util.GeoDistance(lCurrentLocation, lStopLocation1)}`);
            }
            else {
                break;
            }
        }
    }
    DrivingUI.AdvanceToClosestStop = AdvanceToClosestStop;
    ;
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
    function RelevantBusStops(aCurrentTripPointIndex) {
        // Isolate all stops that will appear on Driving UI.
        const lRelevantBusStops = [DrivingUI.cRemainingBusStops[0]];
        if (DrivingUI.cRemainingBusStops.length > 1)
            lRelevantBusStops.push(DrivingUI.cRemainingBusStops[1]);
        if (DrivingUI.cRemainingBusStops.length > 2)
            lRelevantBusStops.push(DrivingUI.cRemainingBusStops[2]);
        if (DrivingUI.cRemainingBusStops.length > 3) {
            // Add the next timepoint.
            let lIndex = 3;
            while (lIndex < DrivingUI.cRemainingBusStops.length) {
                if (DrivingUI.cRemainingBusStops[lIndex].mBusStop.timepoint === 1) {
                    lRelevantBusStops.push(DrivingUI.cRemainingBusStops[lIndex]);
                    break;
                }
                lIndex++;
            }
            // Add the final stop.
            lRelevantBusStops.push(DrivingUI.cRemainingBusStops[DrivingUI.cRemainingBusStops.length - 1]);
        }
        ;
        return lRelevantBusStops;
    }
    DrivingUI.RelevantBusStops = RelevantBusStops;
    ;
    function UpcomingStopsTableValues(aCurrentCoordinates, aCurrentTime, aRelevantBusStops) {
        const lDateString = Util.DateString(aCurrentTime);
        const lUpcomingStopsTableValues = aRelevantBusStops.map(aBusStop => {
            const lDepartureTimeString = aBusStop.mBusStop.departure_time;
            const lBusStopCoordinates = { mX: aBusStop.mBusStop.stop.geometry.coordinates[0], mY: aBusStop.mBusStop.stop.geometry.coordinates[0] };
            const lDepartureTime = Util.DateFromStrings(lDateString, lDepartureTimeString);
            const lTimeDifference = Util.DeltaTime(aCurrentTime, lDepartureTime);
            const lTimeDifferenceString = Util.DurationString(lTimeDifference);
            const lCountdown = lTimeDifferenceString; // HH:MM:SS
            const lDistance = Util.GeoDistance(aCurrentCoordinates, lBusStopCoordinates);
            const lAvgSpeedMin = 3.6 * lDistance / (lTimeDifference / 1000 + 60); // Average Km/h at max allowed delay
            const lAvgSpeedMax = 3.6 * lDistance / (lTimeDifference / 1000 - 15); // Average Km/h at max allowed lead time
            const lAdjSpeedMin = "---"; // Average min speed adjusted for historic recorded speeds/delays on trip/route
            const lAdjSpeedMax = "---"; // Average max speed adjusted for historic recorded speeds/delays on trip/route
            const lDeltaETA = 0; // MM:SS
            const lDelay = 0; // MM:SS
            return {
                DepartureTime: `${aBusStop.mBusStop.departure_time} (${lCountdown})`,
                T: aBusStop.mBusStop.timepoint > 0 ? "T" : "",
                Name: aBusStop.mBusStop.stop.stop_name,
                Distance: `${Math.round(lDistance)}m`,
                AvgSpeed: `${Math.round(lAvgSpeedMin)}km/h - ${Math.round(lAvgSpeedMax)}km/h`,
                AdjSpeed: `${lAdjSpeedMin} - ${lAdjSpeedMax}`,
                ETA: `${lDeltaETA} (${lDelay})`,
            };
        });
        // const lFinalDestinationSpacerRow = { DepartureTime: "<span class='small-ui'>Final Destination:</span>", T: "---", Name: "---", AvgSpeed: "---", AdjSpeed: "---", ETA: "---" };
        // const lTimepointSpacerRow = { DepartureTime: "<span class='small-ui'>Next Timepoint:</span>", T: "---", Name: "---", AvgSpeed: "---", AdjSpeed: "---", ETA: "---" };
        // const lTimepointAbsentRow = { DepartureTime: "", T: "", Name: "", AvgSpeed: "", AdjSpeed: "", ETA: "" };
        const lSpacerRow = { DepartureTime: "<span class='small-ui'>Next Timepoint & Final Destination:</span>", T: "---", Name: "---", Distance: "---", AvgSpeed: "---", AdjSpeed: "---", ETA: "---" };
        lUpcomingStopsTableValues.splice(3, 0, lSpacerRow);
        return lUpcomingStopsTableValues;
    }
    DrivingUI.UpcomingStopsTableValues = UpcomingStopsTableValues;
    ;
    function ClosestTripPointIndex(aCurrentCoordinates) {
        const lGeometry = DrivingUI.cFetchedTrip.shape.geometry.coordinates;
        let lClosestDistance = Infinity;
        lGeometry.forEach((aPoint, aIndex) => {
            const lDistance = Util.GeoDistance(aCurrentCoordinates, { mX: aPoint[0], mY: aPoint[1] });
            if (lDistance < lClosestDistance) {
                DrivingUI.cCurrentTripPointIndex = aIndex;
                lClosestDistance = lDistance;
            }
        });
        return DrivingUI.cCurrentTripPointIndex;
    }
    DrivingUI.ClosestTripPointIndex = ClosestTripPointIndex;
    ;
    function GenerateAugmentedBusStops() {
        DrivingUI.cRemainingBusStops = DrivingUI.cFetchedTrip.stop_times.map(aBusStop => ({ mBusStop: aBusStop }));
    }
    DrivingUI.GenerateAugmentedBusStops = GenerateAugmentedBusStops;
    ;
    function StartTrip() {
        if (DrivingUI.cFetchedTrip) {
            DrivingUI.cCurrentTripPointIndex = 0;
            GenerateAugmentedBusStops();
            // GenerateTripStopCorrelations();
            // GenerateAugmentedGeometry();
        }
    }
    DrivingUI.StartTrip = StartTrip;
    ;
    function Update() {
        const lCurrentTime = Main.CurrentTime();
        const lBusNumber = (DrivingUI.cFetchedRoute === null || DrivingUI.cFetchedRoute === void 0 ? void 0 : DrivingUI.cFetchedRoute.route_short_name) || "999";
        const lTripHeadsign = (DrivingUI.cFetchedTrip === null || DrivingUI.cFetchedTrip === void 0 ? void 0 : DrivingUI.cFetchedTrip.trip_headsign) || "No Service";
        Main.SetHeadsign("BusHeadsign", lBusNumber, lTripHeadsign, lCurrentTime);
        if (DrivingUI.cFetchedTrip) {
            const lLocation = Main.cCurrentPosition.coords;
            const lCurrentCoordinates = { mX: lLocation.longitude, mY: lLocation.latitude };
            const lTrip = DrivingUI.cFetchedTrip;
            AdvanceToClosestStop(lLocation);
            const lRelevantBusStops = RelevantBusStops(DrivingUI.cCurrentTripPointIndex);
            //!@#TODO: Ensure lCurrentTime is timestamp of lCurrentCoordinates from GeoLocation:
            const lUpcomingStopsTableValues = UpcomingStopsTableValues(lCurrentCoordinates, lCurrentTime, lRelevantBusStops);
            // Populate the bus stops table.
            const lTableHeaders = ["DepartureTime", "T", "Name", "Distance", "AvgSpeed", "AdjSpeed", "ETA"];
            UI.PopulateTable("UpcomingStopsTable", lUpcomingStopsTableValues, lTableHeaders, true);
        }
    }
    DrivingUI.Update = Update;
    ;
})(DrivingUI || (DrivingUI = {}));
;
var Main;
(function (Main) {
    Main.cUserSettings = {
        TransitLandAPIKey: '',
        OperatorID: '',
        BusStopDelaySeconds: '30',
        DestinationFilter: '', // Comma-separated list of partial headsign matches.
    };
    Main.cRealStartTime = new Date();
    Main.cSimulatedStartTime = Main.cRealStartTime;
    function CurrentTime() {
        const lNow = new Date();
        const lElapsedTime = lNow.getTime() - Main.cRealStartTime.getTime();
        const lSimulatedNow = Util.DatePlusMilliSeconds(Main.cSimulatedStartTime, lElapsedTime);
        return lSimulatedNow;
        // return lNow
    }
    Main.CurrentTime = CurrentTime;
    ;
    function SimulatedTimeSync(aRealTime, aSimulatedTime) {
        Main.cRealStartTime = aRealTime;
        Main.cSimulatedStartTime = aSimulatedTime;
    }
    Main.SimulatedTimeSync = SimulatedTimeSync;
    ;
    function TransitLand() {
        const lApiKey = Main.cUserSettings.TransitLandAPIKey.trim();
        if (lApiKey) {
            return TransitLandAPIClient.Client(lApiKey);
        }
    }
    Main.TransitLand = TransitLand;
    ;
    function ProcessUserSettings() {
        Main.cDestinationFilter = Main.cUserSettings.DestinationFilter.split(',').map(aDestination => aDestination.trim());
    }
    Main.ProcessUserSettings = ProcessUserSettings;
    ;
    function SetHeadsign(aElementID, aBusNumber, aTripHeadsign, aCurrentTime) {
        const lBusHeadsignField = document.getElementById(aElementID);
        lBusHeadsignField.innerHTML = `${aBusNumber}: ${aTripHeadsign} | ${Util.DateString(aCurrentTime)} ${Util.TimeString(aCurrentTime)}`;
    }
    Main.SetHeadsign = SetHeadsign;
    ;
    Main.cPositionUpdateCounter = 0;
    function PositionWatch(aPosition) {
        const lCoordinate = aPosition.coords;
        const lCoordinateSpan = document.getElementById('CoordinateSpan');
        Main.cPositionUpdateCounter++;
        lCoordinateSpan.textContent = `Lat: ${lCoordinate.latitude}, Lon: ${lCoordinate.longitude} (${new Date(aPosition.timestamp).toLocaleString()} - ${Main.cPositionUpdateCounter})`;
        Main.cCurrentPosition = aPosition;
        DrivingUI.Update();
    }
    Main.PositionWatch = PositionWatch;
    ;
    window.onload = () => {
        UI.ShowPanel('DrivingPanel');
        SettingsUI.LoadSettingsFromStorage();
        SettingsUI.PopulateSettingsTable();
        const lEndTimeInput = document.getElementById('TripSearchMinutes');
        lEndTimeInput.value = "60";
        const lWatchID = navigator.geolocation.watchPosition(PositionWatch);
    };
})(Main || (Main = {}));
;
