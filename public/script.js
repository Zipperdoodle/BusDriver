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
    DrivingUI.cAtBusStop = false;
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
        const lCurrentLocation = { mX: aCurrentGeoLocation.longitude, mY: aCurrentGeoLocation.latitude };
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
                if (Util.GeoDistance(lCurrentLocation, lStopLocation0) < +Main.cUserSettings.AtBusStopRange) {
                    DrivingUI.cAtBusStop = true;
                    console.log(`Approaching stop ${DrivingUI.cRemainingBusStops[0].mBusStop.stop.stop_name} at distance ${Util.GeoDistance(lCurrentLocation, lStopLocation0)}`);
                }
                else {
                    if (DrivingUI.cAtBusStop) {
                        DrivingUI.cAtBusStop = false;
                        const lByeStop = DrivingUI.cRemainingBusStops.shift();
                        console.log(`Passing stop ${lByeStop === null || lByeStop === void 0 ? void 0 : lByeStop.mBusStop.stop.stop_name} at distance ${Util.GeoDistance(lCurrentLocation, lStopLocation0)}`);
                    }
                }
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
            const lDistance = aBusStop.mTripDistanceToHere - DrivingUI.cDistanceTravelled; //Util.GeoDistance(aCurrentCoordinates, lBusStopCoordinates);
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
                DrivingUI.cMinSpeed = lAvgSpeedMin;
                DrivingUI.cMaxSpeed = lAvgSpeedMax;
                DrivingUI.cExactSpeed = lAvgSpeedExact;
                DrivingUI.cPunctualityString = lETAString;
                DrivingUI.cCurrentDelay = lDelay;
                DrivingUI.cCurrentEta = lDeltaETA;
            }
            return {
                Time: `Dep: ${aBusStop.mBusStop.departure_time} (${Util.DurationStringHHMMSS(lCountdown)})<br>ETA: ${lSpeed > 0.01 ? lETAString : "---"}`,
                T: aBusStop.mBusStop.timepoint > 0 ? "T" : "",
                Name: aIndex == 0 && DrivingUI.cAtBusStop ? `*** ${aBusStop.mBusStop.stop.stop_name}` : aBusStop.mBusStop.stop.stop_name,
                Distance: lDistance < 1000 ? `${Math.round(lDistance)}m` : `${Math.round(lDistance / 100) / 10}km`,
                AvgSpeed: `${Math.round(lAvgSpeedExact)}km/h<br>(${Math.round(lAvgSpeedMin)} - ${Math.round(lAvgSpeedMax)})`,
                AdjSpeed: `${lAdjSpeedMin} - ${lAdjSpeedMax}`, //  and this on the route shape distance, until we can upgrade to adjusting for logged trip data.
            };
        });
        // const lFinalDestinationSpacerRow = { DepartureTime: "<span class='small-ui'>Final Destination:</span>", T: "---", Name: "---", AvgSpeed: "---", AdjSpeed: "---", ETA: "---" };
        // const lTimepointSpacerRow = { DepartureTime: "<span class='small-ui'>Next Timepoint:</span>", T: "---", Name: "---", AvgSpeed: "---", AdjSpeed: "---", ETA: "---" };
        // const lTimepointAbsentRow = { DepartureTime: "", T: "", Name: "", AvgSpeed: "", AdjSpeed: "", ETA: "" };
        const lSpacerRow = { Time: "<span class='small-ui'>Next Timepoint & Final Destination:</span>", T: "---", Name: "---", Distance: "---", AvgSpeed: "---", AdjSpeed: "---" };
        lUpcomingStopsTableValues.splice(3, 0, lSpacerRow);
        return lUpcomingStopsTableValues;
    }
    DrivingUI.UpcomingStopsTableValues = UpcomingStopsTableValues;
    ;
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
    function ClosestTripPoint(aTrip, aCoordinates) {
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
    }
    DrivingUI.ClosestTripPoint = ClosestTripPoint;
    ;
    function GenerateAugmentedBusStops() {
        DrivingUI.cRemainingBusStops = DrivingUI.cFetchedTrip.stop_times.map(aBusStop => {
            return {
                mCoordinates: { mX: aBusStop.stop.geometry.coordinates[0], mY: aBusStop.stop.geometry.coordinates[1] },
                mBusStop: aBusStop,
                mTripDistanceToHere: 0,
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
            GenerateAugmentedBusStops();
            GenerateAugmentedGeometry();
            GenerateTripStopCorrelations();
        }
    }
    DrivingUI.StartTrip = StartTrip;
    ;
    function AdvanceTripPoint(lCurrentCoordinates) {
        const lDistance = Util.GeoDistance(lCurrentCoordinates, DrivingUI.cRemainingTripPoints[0].mCoordinates);
        if (lDistance > DrivingUI.cLastDistanceToTripPoint && DrivingUI.cRemainingTripPoints.length > 1) {
            const lByeTripPoint = DrivingUI.cRemainingTripPoints.shift();
            if ((lByeTripPoint === null || lByeTripPoint === void 0 ? void 0 : lByeTripPoint.mDrivingInfo.mBusStop) === DrivingUI.cRemainingBusStops[0]) {
                DrivingUI.cRemainingBusStops.shift();
            }
            DrivingUI.cLastDistanceToTripPoint = Infinity;
        }
        else {
            DrivingUI.cLastDistanceToTripPoint = lDistance;
        }
        ;
    }
    DrivingUI.AdvanceTripPoint = AdvanceTripPoint;
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
    function UpdatePosition() {
        if (DrivingUI.cFetchedTrip) {
            DrivingUI.cLastDistanceToTripPoint = Infinity;
            StartTrip();
            //!@#:TODO Advance to closest trip point
        }
    }
    DrivingUI.UpdatePosition = UpdatePosition;
    ;
    function Update() {
        const lCurrentTime = Main.CurrentTime();
        const lBusNumber = (DrivingUI.cFetchedRoute === null || DrivingUI.cFetchedRoute === void 0 ? void 0 : DrivingUI.cFetchedRoute.route_short_name) || "999";
        const lTripHeadsign = (DrivingUI.cFetchedTrip === null || DrivingUI.cFetchedTrip === void 0 ? void 0 : DrivingUI.cFetchedTrip.trip_headsign) || "No Service";
        Main.SetHeadsign("BusHeadsign", lBusNumber, lTripHeadsign, lCurrentTime);
        if (DrivingUI.cFetchedTrip) {
            const lCurrentLocation = Main.cCurrentPosition.coords;
            const lCurrentCoordinates = { mX: lCurrentLocation.longitude, mY: lCurrentLocation.latitude };
            AdvanceTripPoint(lCurrentCoordinates);
            DrivingUI.cDistanceTravelled = DrivingUI.cRemainingTripPoints[0].mDrivingInfo.mTripDistanceToHere + Util.GeoDistance(lCurrentCoordinates, DrivingUI.cRemainingTripPoints[0].mCoordinates);
            const lRelevantBusStops = RelevantBusStops();
            //!@#TODO: Ensure lCurrentTime is timestamp of lCurrentCoordinates from GeoLocation:
            const lUpcomingStopsTableValues = UpcomingStopsTableValues(lCurrentCoordinates, lCurrentTime, lRelevantBusStops);
            // Populate the bus stops table.
            const lTableHeaders = ["Time", "T", "Name", "Distance", "AvgSpeed", "AdjSpeed"];
            UI.PopulateTable("UpcomingStopsTable", lUpcomingStopsTableValues, lTableHeaders, true);
            DrawSpeedometer();
        }
    }
    DrivingUI.Update = Update;
    ;
    function DrawSpeedometer() {
        const lSpeed = (Main.cCurrentPosition.coords.speed || 0) * 3.6;
        DrawPips();
        DrawCurrentSpeed(lSpeed);
        DrawSpeedMarker(lSpeed, 7, "#90EE90", "CurrentSpeedMarker");
        DrawSpeedMarker(DrivingUI.cMaxSpeed, 5, "red", "MaxSpeedMarker");
        DrawSpeedMarker(DrivingUI.cExactSpeed, 5, "green", "ExactSpeedMarker");
        DrawSpeedMarker(DrivingUI.cMinSpeed, 5, "yellow", "MinSpeedMarker");
    }
    DrivingUI.DrawSpeedometer = DrawSpeedometer;
    ;
    function DrawPips() {
        const lSvgElement = document.getElementById("SpeedBar");
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
    function DrawCurrentSpeed(aCurrentSpeed) {
        const lSvgElement = document.getElementById("SpeedBar");
        const lPositionX = (aCurrentSpeed / 100) * 1000;
        const lExistingIndicator = document.getElementById("SpeedIndicator");
        if (lExistingIndicator)
            lSvgElement === null || lSvgElement === void 0 ? void 0 : lSvgElement.removeChild(lExistingIndicator);
        const lRectangleElement = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        lRectangleElement.setAttribute("id", "SpeedIndicator");
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
    function DrawSpeedMarker(aSpeed, aWidth, aColor, aID) {
        const lSvgElement = document.getElementById("SpeedBar");
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
            lGeolocationField.innerHTML = `${lCoordinatesString} | ${lDerivativesString}<br>${lAccuracyString} (${lGeolocationTimestampString} - ${Main.cPositionUpdateCounter})`;
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
