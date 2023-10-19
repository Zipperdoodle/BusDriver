"use strict";
var Util;
(function (Util) {
    ;
    ;
    function Clamp(aValue, aMinimum, aMaximum) {
        return Math.min(Math.max(aValue, aMinimum), aMaximum);
    }
    Util.Clamp = Clamp;
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
    function CircumferenceAtLatitude(aEquatorialCircumference, aPolarCircumference, aLatitude) {
        const lEquatorialRadius = aEquatorialCircumference / (2 * Math.PI);
        const lPolarRadius = aPolarCircumference / (2 * Math.PI);
        const lLatitudeRadians = aLatitude * (Math.PI / 180);
        const lCosLatitudeSquared = Math.cos(lLatitudeRadians) ** 2;
        const lSinLatitudeSquared = Math.sin(lLatitudeRadians) ** 2;
        const lAverageRadius = Math.sqrt((lEquatorialRadius ** 2 * lCosLatitudeSquared + lPolarRadius ** 2 * lSinLatitudeSquared) / 2);
        return 2 * Math.PI * lAverageRadius;
    }
    Util.CircumferenceAtLatitude = CircumferenceAtLatitude;
    function GeoDistance(aPoint1, aPoint2) {
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
    function DurationStringHHMMSS(aMilliSeconds) {
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
    Util.DurationStringHHMMSS = DurationStringHHMMSS;
    function DurationStringMMSS(aMilliSeconds) {
        const lAbsDeltaMilliseconds = Math.abs(aMilliSeconds);
        const lMinutes = Math.floor(lAbsDeltaMilliseconds / (1000 * 60));
        const lSeconds = Math.floor((lAbsDeltaMilliseconds % (1000 * 60)) / 1000);
        const lFormattedMinutes = lMinutes.toString().padStart(2, '0');
        const lFormattedSeconds = lSeconds.toString().padStart(2, '0');
        const lSign = aMilliSeconds < 0 ? '-' : '+';
        return `${lSign}${lFormattedMinutes}:${lFormattedSeconds}`;
    }
    Util.DurationStringMMSS = DurationStringMMSS;
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
    function ToggleDarkMode() {
        document.body.classList.toggle("dark-mode");
    }
    UI.ToggleDarkMode = ToggleDarkMode;
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
                lBusStopLocations.sort(Util.DistanceComparator({ mX: lCurrentLongitude, mY: lCurrentLatitude }, Util.GeoDistance));
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
        const lStartTime = Util.DatePlusMilliSeconds(lNow, +Main.cUserSettings.NewTripSearchStartTimeOffset * 60 * 1000);
        const lDateString = Util.DateString(lNow);
        const lTimeString = Util.TimeString(lNow);
        const lStartTimeString = Util.TimeString(lStartTime);
        const lDateInput = document.getElementById('TripSearchDate');
        const lStartTimeInput = document.getElementById('TripSearchStart');
        const lSimulatedTimeInput = document.getElementById('SimulatedTimeStart');
        // Set the values of the input elements
        lDateInput.value = lDateString;
        lStartTimeInput.value = lStartTimeString;
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
    function RelevantBusStops() {
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
        const lUpcomingStopsTableValues = aRelevantBusStops.map((aBusStop, aIndex) => {
            const lDepartureTimeString = aBusStop.mBusStop.departure_time;
            const lDepartureTime = Util.DateFromStrings(lDateString, lDepartureTimeString);
            const lCountdown = Util.DeltaTime(aCurrentTime, lDepartureTime);
            const lTravelDistance = aBusStop.mTripDistanceToHere - DrivingUI.cDistanceTravelled;
            const lCrowDistance = Util.GeoDistance(aCurrentCoordinates, aBusStop.mCoordinates);
            const lAvgSpeedMin = Util.Clamp(3.6 * lTravelDistance / (lCountdown / 1000 + (+Main.cUserSettings.DepartureMaxDelay)), 0, 99); // Average Km/h at max allowed delay
            const lAvgSpeedMax = Util.Clamp(3.6 * lTravelDistance / (lCountdown / 1000 + (+Main.cUserSettings.DepartureMaxLead)), 0, 99); // Average Km/h at max allowed lead time
            const lAvgSpeedExact = Util.Clamp(3.6 * lTravelDistance / (lCountdown / 1000), 0, 99); // Average Km/h at exact schedule time
            const lCrowSpeedMin = Util.Clamp(3.6 * lCrowDistance / (lCountdown / 1000 + (+Main.cUserSettings.DepartureMaxDelay)), 0, 99); // As lAvgSpeedXXX, but for distances "as the crow flies"
            const lCrowSpeedMax = Util.Clamp(3.6 * lCrowDistance / (lCountdown / 1000 + (+Main.cUserSettings.DepartureMaxLead)), 0, 99);
            const lCrowSpeedExact = Util.Clamp(3.6 * lCrowDistance / (lCountdown / 1000), 0, 99);
            // const lDeltaETA = Util.Clamp(1000 * lDistance / (Main.cCurrentPosition.coords.speed || 0), 0, (99 * 3600 + 59 * 60 + 59) * 1000);
            const lSpeed = Main.cCurrentPosition.coords.speed || 0;
            const lDeltaETA = 1000 * lTravelDistance / lSpeed;
            const lDelay = lDeltaETA - lCountdown;
            const lETAString = `${Util.DurationStringHHMMSS(lDelay)} (${Util.DurationStringHHMMSS(lDeltaETA)})`;
            if (aIndex == 0) {
                DrivingUI.cAvgMinSpeed = lAvgSpeedMin;
                DrivingUI.cAvgMaxSpeed = lAvgSpeedMax;
                DrivingUI.cAvgExactSpeed = lAvgSpeedExact;
                DrivingUI.cCrowMinSpeed = lCrowSpeedMin;
                DrivingUI.cCrowMaxSpeed = lCrowSpeedMax;
                DrivingUI.cCrowExactSpeed = lCrowSpeedExact;
                DrivingUI.cPunctualityString = lETAString;
                DrivingUI.cCurrentDelay = lDelay;
                DrivingUI.cCurrentEta = lDeltaETA;
            }
            return {
                Time: `Dep: ${aBusStop.mBusStop.departure_time} (${Util.DurationStringHHMMSS(lCountdown)})<br>ETA: ${lSpeed > 0.01 ? lETAString : "---"}`,
                T: aBusStop.mBusStop.timepoint > 0 ? "T" : "",
                Name: aIndex == 0 && DrivingUI.cAtBusStop === aBusStop ? `*** ${aBusStop.mBusStop.stop.stop_name}` : aBusStop.mBusStop.stop.stop_name,
                Distance: (lTravelDistance < 1000 ? `${Math.round(lTravelDistance)}m` : `${Math.round(lTravelDistance / 100) / 10}km`) + (lCrowDistance < 1000 ? `<br>(${Math.round(lCrowDistance)}m crow)` : `<br>(${Math.round(lCrowDistance / 100) / 10}km crow)`),
                AvgSpeed: `${Math.round(lAvgSpeedExact)}km/h<br>(${Math.round(lAvgSpeedMin)} - ${Math.round(lAvgSpeedMax)})`,
                CrowSpeed: `${Math.round(lCrowSpeedExact)}km/h<br>(${Math.round(lCrowSpeedMin)} - ${Math.round(lCrowSpeedMax)})`,
            };
        });
        // const lFinalDestinationSpacerRow = { DepartureTime: "<span class='small-ui'>Final Destination:</span>", T: "---", Name: "---", AvgSpeed: "---", CrowSpeed: "---", ETA: "---" };
        // const lTimepointSpacerRow = { DepartureTime: "<span class='small-ui'>Next Timepoint:</span>", T: "---", Name: "---", AvgSpeed: "---", CrowSpeed: "---", ETA: "---" };
        // const lTimepointAbsentRow = { DepartureTime: "", T: "", Name: "", AvgSpeed: "", CrowSpeed: "", ETA: "" };
        const lSpacerRow = { Time: "<span class='small-ui'>Next Timepoint & Final Destination:</span>", T: "---", Name: "---", Distance: "---", AvgSpeed: "---", CrowSpeed: "---" };
        lUpcomingStopsTableValues.splice(3, 0, lSpacerRow);
        return lUpcomingStopsTableValues;
    }
    DrivingUI.UpcomingStopsTableValues = UpcomingStopsTableValues;
    ;
    function ClosestTripPoint(aTrip, aCoordinates) {
        let lResult = aTrip[0];
        let lClosestDistance = Infinity;
        aTrip.forEach(aTripPoint => {
            const lDistance = Util.GeoDistance(aCoordinates, aTripPoint.mCoordinates);
            if (lDistance < lClosestDistance) {
                lClosestDistance = lDistance;
                lResult = aTripPoint;
            }
        });
        return lResult;
    }
    DrivingUI.ClosestTripPoint = ClosestTripPoint;
    ;
    function GenerateAugmentedBusStops() {
        DrivingUI.cRemainingBusStops = DrivingUI.cFetchedTrip.stop_times.map(aBusStop => {
            return {
                mCoordinates: { mX: aBusStop.stop.geometry.coordinates[0], mY: aBusStop.stop.geometry.coordinates[1] },
                mBusStop: aBusStop,
                mTripDistanceToHere: 0, // To be updated by GenerateTripStopCorrelations()
            };
        });
    }
    DrivingUI.GenerateAugmentedBusStops = GenerateAugmentedBusStops;
    ;
    function GenerateAugmentedGeometry() {
        let lTripDistance = 0;
        DrivingUI.cRemainingTripPoints = DrivingUI.cFetchedTrip.shape.geometry.coordinates.map((aTripPoint, aIndex, aArray) => {
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
    }
    DrivingUI.GenerateAugmentedGeometry = GenerateAugmentedGeometry;
    ;
    function GenerateTripStopCorrelations() {
        let lTripPointIndex = 0;
        DrivingUI.cRemainingBusStops.forEach((aBusStop, aBusStopIndex) => {
            const lLineDistanceFn = Util.PerpendicularDistanceMapper(aBusStop.mCoordinates);
            let lClosestLineStartIndex = 0;
            let lClosestDistance = Infinity;
            let lIndex = lTripPointIndex;
            while (lIndex < DrivingUI.cRemainingTripPoints.length - 1) {
                const lLineDistance = lLineDistanceFn(DrivingUI.cRemainingTripPoints[lIndex].mCoordinates, DrivingUI.cRemainingTripPoints[lIndex + 1].mCoordinates);
                if (lLineDistance < lClosestDistance) {
                    lClosestDistance = lLineDistance;
                    lClosestLineStartIndex = lIndex;
                }
                lIndex++;
            }
            // Insert new point at exact location of bus stop.
            // There often is a point within 1m already, but often there isn't, and we want to simplify things while driving.
            const lDistanceToPreviousPoint = Util.GeoDistance(aBusStop.mCoordinates, DrivingUI.cRemainingTripPoints[lClosestLineStartIndex].mCoordinates);
            const lDistanceToNextPoint = Util.GeoDistance(aBusStop.mCoordinates, DrivingUI.cRemainingTripPoints[lClosestLineStartIndex + 1].mCoordinates);
            const lDistanceToHere = DrivingUI.cRemainingTripPoints[lClosestLineStartIndex].mDrivingInfo.mTripDistanceToHere + lDistanceToPreviousPoint;
            aBusStop.mTripDistanceToHere = lDistanceToHere;
            console.log(`BusStop #${aBusStopIndex}: ${aBusStop.mBusStop.stop.stop_name}, Line distance: ${lClosestDistance}`);
            console.log(`Distance to point #${lClosestLineStartIndex}: ${lDistanceToPreviousPoint}`);
            console.log(`Distance to point #${lClosestLineStartIndex + 1}: ${lDistanceToNextPoint}`);
            console.log(`Travel distance to stop: ${lDistanceToHere}`);
            DrivingUI.cRemainingTripPoints.splice(lClosestLineStartIndex, 0, { mCoordinates: aBusStop.mCoordinates, mDrivingInfo: { mTripDistanceToHere: lDistanceToHere, mBusStop: aBusStop } });
            lTripPointIndex = lClosestLineStartIndex + 1; // Might be multiple stops along the same original line
        });
    }
    DrivingUI.GenerateTripStopCorrelations = GenerateTripStopCorrelations;
    ;
    function StartTrip() {
        if (DrivingUI.cFetchedTrip) {
            DrivingUI.cLastDistanceToTripPoint = Infinity;
            DrivingUI.cDistanceTravelled = 0;
            DrivingUI.cIncreasedDistanceCount = 0;
            GenerateAugmentedBusStops();
            GenerateAugmentedGeometry();
            GenerateTripStopCorrelations();
            GotoClosestTripPoint();
        }
    }
    DrivingUI.StartTrip = StartTrip;
    ;
    function ClosestBusStop(aBusStops, aCoordinates) {
        let lResult = aBusStops[0];
        let lClosestDistance = Infinity;
        aBusStops.forEach(aBusStop => {
            const lDistance = Util.GeoDistance(aCoordinates, aBusStop.mCoordinates);
            if (lDistance < lClosestDistance) {
                lClosestDistance = lDistance;
                lResult = aBusStop;
            }
        });
        return lResult;
    }
    DrivingUI.ClosestBusStop = ClosestBusStop;
    ;
    function SkipToStop(aBusStop) {
        while (DrivingUI.cRemainingBusStops.length > 1 && DrivingUI.cRemainingBusStops[0] !== aBusStop) {
            DrivingUI.cRemainingBusStops.shift();
        }
        while (DrivingUI.cRemainingTripPoints.length > 1 && DrivingUI.cRemainingTripPoints[0].mDrivingInfo.mBusStop !== aBusStop) {
            DrivingUI.cRemainingTripPoints.shift();
        }
        DrivingUI.cLastDistanceToTripPoint = Infinity;
    }
    DrivingUI.SkipToStop = SkipToStop;
    ;
    function AdvanceTripPoint(aCurrentCoordinates) {
        const lDistance = Util.GeoDistance(aCurrentCoordinates, DrivingUI.cRemainingTripPoints[0].mCoordinates);
        if (DrivingUI.cRemainingTripPoints.length > 1 && lDistance > DrivingUI.cLastDistanceToTripPoint && lDistance < 500) {
            const lByeTripPoint = DrivingUI.cRemainingTripPoints.shift();
            if ((lByeTripPoint === null || lByeTripPoint === void 0 ? void 0 : lByeTripPoint.mDrivingInfo.mBusStop) === DrivingUI.cRemainingBusStops[0]) {
                DrivingUI.cRemainingBusStops.shift();
                DrivingUI.cLastDistanceToTripPoint = Util.GeoDistance(aCurrentCoordinates, DrivingUI.cRemainingTripPoints[0].mCoordinates);
                return;
            }
        }
        DrivingUI.cLastDistanceToTripPoint = lDistance;
    }
    DrivingUI.AdvanceTripPoint = AdvanceTripPoint;
    ;
    function GotoClosestTripPoint() {
        const lCurrentCoordinates = { mX: Main.cCurrentPosition.coords.longitude, mY: Main.cCurrentPosition.coords.latitude };
        const lClosestTripPoint = ClosestTripPoint(DrivingUI.cRemainingTripPoints, lCurrentCoordinates);
        while (DrivingUI.cRemainingTripPoints[0] !== lClosestTripPoint) {
            const lByeTripPoint = DrivingUI.cRemainingTripPoints.shift();
            if ((lByeTripPoint === null || lByeTripPoint === void 0 ? void 0 : lByeTripPoint.mDrivingInfo.mBusStop) === DrivingUI.cRemainingBusStops[0]) {
                DrivingUI.cRemainingBusStops.shift();
            }
            DrivingUI.cLastDistanceToTripPoint = Util.GeoDistance(lCurrentCoordinates, DrivingUI.cRemainingTripPoints[0].mCoordinates);
        }
    }
    DrivingUI.GotoClosestTripPoint = GotoClosestTripPoint;
    ;
    function AdvanceToClosestTripLine(lCurrentCoordinates) {
        const lLineDistanceFn = Util.PerpendicularDistanceMapper(lCurrentCoordinates);
        let lClosestLineStartIndex = 0;
        let lClosestDistance = Infinity;
        let lTripPointIndex = 0;
        // Find trip line closest to current location
        while (lTripPointIndex < DrivingUI.cRemainingTripPoints.length - 1) {
            const lLineDistance = lLineDistanceFn(DrivingUI.cRemainingTripPoints[lTripPointIndex].mCoordinates, DrivingUI.cRemainingTripPoints[lTripPointIndex + 1].mCoordinates);
            if (lLineDistance < lClosestDistance) {
                lClosestDistance = lLineDistance;
                lClosestLineStartIndex = lTripPointIndex;
            }
            lTripPointIndex++;
        }
        ;
        // Remove any points and bus stops ahead of closest line
        while (lClosestLineStartIndex > 0) {
            const lByeTripPoint = DrivingUI.cRemainingTripPoints.shift();
            if ((lByeTripPoint === null || lByeTripPoint === void 0 ? void 0 : lByeTripPoint.mDrivingInfo.mBusStop) === DrivingUI.cRemainingBusStops[0]) {
                DrivingUI.cRemainingBusStops.shift();
            }
            lClosestLineStartIndex--;
        }
    }
    DrivingUI.AdvanceToClosestTripLine = AdvanceToClosestTripLine;
    function CheckForClosestBusStop(aCurrentCoordinates) {
        const lClosestBusStop = ClosestBusStop(DrivingUI.cRemainingBusStops, aCurrentCoordinates);
        if (lClosestBusStop !== DrivingUI.cRemainingBusStops[0]) {
            const lDistance = Util.GeoDistance(aCurrentCoordinates, lClosestBusStop.mCoordinates);
            if (lDistance < 100) {
                SkipToStop(lClosestBusStop);
            }
        }
    }
    DrivingUI.CheckForClosestBusStop = CheckForClosestBusStop;
    ;
    function SkipCurrentStop() {
        if (DrivingUI.cRemainingBusStops.length > 1) {
            SkipToStop(DrivingUI.cRemainingBusStops[1]);
        }
    }
    DrivingUI.SkipCurrentStop = SkipCurrentStop;
    ;
    function Update() {
        const lCurrentTime = Main.CurrentTime();
        const lBusNumber = (DrivingUI.cFetchedRoute === null || DrivingUI.cFetchedRoute === void 0 ? void 0 : DrivingUI.cFetchedRoute.route_short_name) || "999";
        const lTripHeadsign = (DrivingUI.cFetchedTrip === null || DrivingUI.cFetchedTrip === void 0 ? void 0 : DrivingUI.cFetchedTrip.trip_headsign) || "No Service";
        Main.SetHeadsign("BusHeadsign", lBusNumber, lTripHeadsign, lCurrentTime);
        if (DrivingUI.cFetchedTrip) {
            const lCurrentLocation = Main.cCurrentPosition.coords;
            const lCurrentCoordinates = { mX: lCurrentLocation.longitude, mY: lCurrentLocation.latitude };
            if (lCurrentLocation.speed && lCurrentLocation.speed > 0) {
                CheckForClosestBusStop(lCurrentCoordinates);
                AdvanceTripPoint(lCurrentCoordinates);
            }
            DrivingUI.cDistanceTravelled = DrivingUI.cRemainingTripPoints[0].mDrivingInfo.mTripDistanceToHere - DrivingUI.cLastDistanceToTripPoint;
            const lRelevantBusStops = RelevantBusStops();
            //!@#TODO: Ensure lCurrentTime is timestamp of lCurrentCoordinates from GeoLocation:
            const lUpcomingStopsTableValues = UpcomingStopsTableValues(lCurrentCoordinates, lCurrentTime, lRelevantBusStops);
            // Populate the bus stops table.
            const lTableHeaders = ["Time", "T", "Name", "Distance", "AvgSpeed", "CrowSpeed"];
            UI.PopulateTable("UpcomingStopsTable", lUpcomingStopsTableValues, lTableHeaders, true);
            DrawSpeedometer("SpeedBar", DrivingUI.cAvgExactSpeed, DrivingUI.cAvgMinSpeed, DrivingUI.cAvgMaxSpeed);
            DrawSpeedometer("CrowSpeedBar", DrivingUI.cCrowExactSpeed, DrivingUI.cCrowMinSpeed, DrivingUI.cCrowMaxSpeed);
        }
    }
    DrivingUI.Update = Update;
    ;
    function DrawSpeedometer(aSVGElementID, aExactSpeed, aMinSpeed, aMaxSpeed) {
        const lSpeed = (Main.cCurrentPosition.coords.speed || 0) * 3.6;
        DrawPips(aSVGElementID);
        DrawCurrentSpeed(aSVGElementID, lSpeed);
        DrawSpeedMarker(aSVGElementID, lSpeed, 7, "#90EE90", aSVGElementID + "_CurrentSpeedMarker");
        DrawSpeedMarker(aSVGElementID, aMaxSpeed, 5, "red", aSVGElementID + "_MaxSpeedMarker");
        DrawSpeedMarker(aSVGElementID, aExactSpeed, 5, "green", aSVGElementID + "_ExactSpeedMarker");
        DrawSpeedMarker(aSVGElementID, aMinSpeed, 5, "yellow", aSVGElementID + "_MinSpeedMarker");
    }
    DrivingUI.DrawSpeedometer = DrawSpeedometer;
    ;
    function DrawPips(aSVGElementID) {
        const lSvgElement = document.getElementById(aSVGElementID);
        for (let lSpeedPip = 0; lSpeedPip <= 100; lSpeedPip += 10) {
            const lPositionX = (lSpeedPip / 100) * 1000;
            const lLineElement = document.createElementNS("http://www.w3.org/2000/svg", "line");
            lLineElement.setAttribute("x1", lPositionX.toString());
            lLineElement.setAttribute("y1", "0");
            lLineElement.setAttribute("x2", lPositionX.toString());
            lLineElement.setAttribute("y2", "30");
            lLineElement.setAttribute("stroke", "black");
            lSvgElement === null || lSvgElement === void 0 ? void 0 : lSvgElement.appendChild(lLineElement);
        }
    }
    DrivingUI.DrawPips = DrawPips;
    ;
    function DrawCurrentSpeed(aSVGElementID, aCurrentSpeed) {
        const lSvgElement = document.getElementById(aSVGElementID);
        const lPositionX = (aCurrentSpeed / 100) * 1000;
        const lExistingIndicator = document.getElementById(aSVGElementID + "_SpeedIndicator");
        if (lExistingIndicator)
            lSvgElement === null || lSvgElement === void 0 ? void 0 : lSvgElement.removeChild(lExistingIndicator);
        const lRectangleElement = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        lRectangleElement.setAttribute("id", aSVGElementID + "_SpeedIndicator");
        lRectangleElement.setAttribute("x", "0");
        lRectangleElement.setAttribute("y", "5");
        lRectangleElement.setAttribute("rx", "5");
        lRectangleElement.setAttribute("ry", "5");
        lRectangleElement.setAttribute("width", lPositionX.toString());
        lRectangleElement.setAttribute("height", "20");
        lRectangleElement.setAttribute("fill", "#90EE90");
        lSvgElement === null || lSvgElement === void 0 ? void 0 : lSvgElement.appendChild(lRectangleElement);
    }
    DrivingUI.DrawCurrentSpeed = DrawCurrentSpeed;
    ;
    function DrawSpeedMarker(aSVGElementID, aSpeed, aWidth, aColor, aID) {
        const lSvgElement = document.getElementById(aSVGElementID);
        const lPositionX = (aSpeed / 100) * 1000 - Math.floor(aWidth / 2);
        const lRectangleElement = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        const lExistingMarker = document.getElementById(aID);
        if (lExistingMarker)
            lSvgElement === null || lSvgElement === void 0 ? void 0 : lSvgElement.removeChild(lExistingMarker);
        lRectangleElement.setAttribute("id", aID);
        lRectangleElement.setAttribute("x", lPositionX.toString());
        lRectangleElement.setAttribute("y", "0");
        lRectangleElement.setAttribute("width", aWidth.toString());
        lRectangleElement.setAttribute("height", "30");
        lRectangleElement.setAttribute("fill", aColor);
        // lRectangleElement.setAttribute("fill", "none");
        // lRectangleElement.setAttribute("stroke", aColor);
        // lRectangleElement.setAttribute("stroke-width", "1");
        lSvgElement === null || lSvgElement === void 0 ? void 0 : lSvgElement.appendChild(lRectangleElement);
    }
    DrivingUI.DrawSpeedMarker = DrawSpeedMarker;
    ;
})(DrivingUI || (DrivingUI = {}));
;
var Main;
(function (Main) {
    Main.cUserSettings = {
        TransitLandAPIKey: '',
        OperatorID: '',
        AtBusStopRange: '25',
        BusStopDelaySeconds: '30',
        DestinationFilter: '',
        DepartureMaxLead: '-15',
        DepartureMaxDelay: '60',
        NewTripSearchStartTimeOffset: '-14',
        NewTripSearchStartTimeRange: '58',
        TripPointStickiness: '0',
        BusStopStickiness: '0',
        TripPointHysteresis: '0',
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
        const lHeadsign = `${aBusNumber}: ${aTripHeadsign}`;
        const lDateString = `${Util.DateString(aCurrentTime)} ${Util.TimeString(aCurrentTime)}`;
        lBusHeadsignField.innerHTML = `${lHeadsign} | ${lDateString} | Punctuality: ${DrivingUI.cPunctualityString}`;
    }
    Main.SetHeadsign = SetHeadsign;
    ;
    Main.cPositionUpdateCounter = 0;
    function StartGeolocationWatch() {
        if (Main.cGeolocationWatchID) {
            navigator.geolocation.clearWatch(Main.cGeolocationWatchID);
        }
        function PositionWatch(aPosition) {
            Main.cPositionUpdateCounter++;
            Main.cCurrentPosition = aPosition;
            const lGeolocationField = document.getElementById("GeolocationValues");
            const lCoordinates = Main.cCurrentPosition.coords;
            const lCoordinatesString = `Lat: ${lCoordinates.latitude}, Lon: ${lCoordinates.longitude}, Alt: ${lCoordinates.altitude || "-"}m`;
            const lSpeed = Math.round((lCoordinates.speed || 0) * 3.6 * 100) / 100; // Converted from m/s to km/h
            const lHeading = Math.round((lCoordinates.heading || 0) * 100) / 100;
            const lDerivativesString = `Spd: ${lSpeed}km/h, Heading: ${lHeading}deg`;
            const lAccuracyString = `Acc: ${lCoordinates.accuracy || "-"}m, AltAcc: ${lCoordinates.altitudeAccuracy || "-"}m`;
            const lGeolocationTimestampString = `${Util.TimeString(new Date(Main.cCurrentPosition.timestamp))}`;
            lGeolocationField.innerHTML = `${lDerivativesString} | ${lCoordinatesString}<br>${lAccuracyString} (${lGeolocationTimestampString} - ${Main.cPositionUpdateCounter})`;
            DrivingUI.Update();
        }
        ;
        function GeolocationWatchError(aError) {
            console.log("Geolocation Error: ", aError.code, aError.message);
        }
        Main.cGeolocationWatchID = navigator.geolocation.watchPosition(PositionWatch, GeolocationWatchError, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
        });
    }
    Main.StartGeolocationWatch = StartGeolocationWatch;
    function ResetGPS() {
        console.log("Reset GPS button pressed...");
        StartGeolocationWatch();
    }
    Main.ResetGPS = ResetGPS;
    ;
    window.onload = () => {
        UI.ShowPanel('DrivingPanel');
        SettingsUI.LoadSettingsFromStorage();
        SettingsUI.PopulateSettingsTable();
        const lEndTimeInput = document.getElementById('TripSearchMinutes');
        lEndTimeInput.value = Main.cUserSettings.NewTripSearchStartTimeRange;
        StartGeolocationWatch();
    };
})(Main || (Main = {}));
;
