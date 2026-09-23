import { SellerProfile } from '@/interfaces/interface';
import { calculateHaversineDistance } from '@/utils/calculateDistance';
import { getLocationName } from '@/utils/captureUserLocationStringAndDistance';
import dayjs from 'dayjs';
import * as Location from '@/utils/platform/location';
import { AlertTriangle, Crosshair, HelpCircle, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Linking, Modal, Scrolldiv, TouchableOpacity } from '@/components/common/ui';
import DeliveryTime from './DeliveryWindow';

interface DistanceCalculatorProps {
  role: 'buyer' | 'seller';
  profile?: SellerProfile;
  isForNearByProducts: boolean;
  onLocationCaptured?: (coords: Coordinates) => void;
  onDeliveryTimeCapture?: (deliveryTime: string) => void;
  onLocationReadyChanged?: (isReady: boolean) => void;
  getCurrentLocationName?: (locationName: string) => void;
  onLocationProductsFetch?: (capturedCoords: {
    latitude: number,
    longitude: number,
  }) => void;
  autoFetch?: boolean;
  existingCoordinates?: Coordinates;
  existingLocationName?: string;
  presentLocationName?: string
}

interface Coordinates {
  latitude: number;
  longitude: number;
}

const ACCURACY_THRESHOLD_METERS = 100;
const GPS_FIX_TIMEOUT_MS = 15000;
const MAX_ACCEPTABLE_ACCURACY_METERS = 300;
const MAX_FIX_AGE_MS = 30000;

const safeStringify = (obj: any) => JSON.stringify(obj, null, 2);

/**
 * Gets a location fix, guaranteeing an accuracy check on EVERY code path.
 * Uses one high-accuracy browser watch and only accepts a fresh, usable fix.
 */
async function getAccurateLocation(
  threshold = ACCURACY_THRESHOLD_METERS,
  timeoutMs = GPS_FIX_TIMEOUT_MS
): Promise<Location.LocationObject> {
  return new Promise<Location.LocationObject>((resolve, reject) => {
    let bestSoFar: Location.LocationObject | null = null;
    let subscription: Location.LocationSubscription | null = null;
    let settled = false;

    const finish = (location?: Location.LocationObject, error?: Error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      subscription?.remove();
      if (location) resolve(location);
      else reject(error || new Error('Unable to capture location'));
    };

    const timeout = setTimeout(() => {
      const accuracy = bestSoFar?.coords.accuracy ?? Infinity;
      if (bestSoFar && accuracy <= MAX_ACCEPTABLE_ACCURACY_METERS) {
        console.log(`⏱️ [Timeout] Using best available location with accuracy: ±${accuracy}m`);
        finish(bestSoFar);
      } else {
        console.log(`⏱️ [Timeout] No acceptable location found. Best accuracy: ±${accuracy}m`);
        finish(undefined, new Location.LocationError('TIMEOUT', 'We could not get a precise location. Move outdoors or near a window, then retry.'));
      }
    }, timeoutMs);

    Location.watchPositionAsync(
      { accuracy: Location.Accuracy.Highest, timeInterval: 1000, distanceInterval: 1 },
      (loc) => {
        const isFresh = Date.now() - loc.timestamp <= MAX_FIX_AGE_MS;
        if (!isFresh) return;
        if (!bestSoFar || (loc.coords.accuracy ?? Infinity) < (bestSoFar.coords.accuracy ?? Infinity)) {
          bestSoFar = loc;
        }
        if (loc.coords.accuracy != null && loc.coords.accuracy <= threshold) {
          finish(loc);
        }
      },
      (error) => finish(undefined, error)
    )
      .then((sub) => {
        subscription = sub;
        if (settled) sub.remove();
      })
      .catch((err) => {
        finish(undefined, err);
      });
  });
}

export default function DistanceCalculator({
  role,
  profile,
  onLocationCaptured,
  onLocationReadyChanged,
  onDeliveryTimeCapture,
  getCurrentLocationName,
  onLocationProductsFetch,
  autoFetch = true,
  existingCoordinates,
  existingLocationName,
  isForNearByProducts=false,
  presentLocationName=''
}: DistanceCalculatorProps) {
  const [distance, setDistance] = useState<string | null>(null);
  const [readableAddress, setReadableAddress] = useState<string | null>(null);
  const [loadingLocation, setLoadingLocation] = useState<boolean>(true);
  const [isRefetching, setIsRefetching] = useState<boolean>(false);
  const [locationGranted, setLocationGranted] = useState<boolean>(false);
  const [permissionDenied, setPermissionDenied] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const [currentUserLocation, setCurrentUserLocation] = useState<Coordinates | null>(null);
  const [possibleOrderTime, setPossibleOrderTime] = useState();
  const [deliveryTime, setDeliveryTime] = useState('');
  const [showLocationModal, setShowLocationModal] = useState<boolean>(false);
  const [showExplanationModal, setShowExplanationModal] = useState<boolean>(false);

  // A counter, not a boolean — every button press guarantees a NEW value,
  // so the effect always re-fires even if the previous attempt failed and
  // never got a chance to "reset" a flag.
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const callbacksRef = useRef({ onLocationCaptured, onLocationReadyChanged, onDeliveryTimeCapture, getCurrentLocationName, onLocationProductsFetch });
  const profileRef = useRef(profile);

  console.log(`🎬 [Mount/Render] DistanceCalculator - Role: "${role}", Loading: ${loadingLocation}`);

  useEffect(() => {
    callbacksRef.current = { onLocationCaptured, onLocationReadyChanged, onDeliveryTimeCapture, getCurrentLocationName, onLocationProductsFetch };
    profileRef.current = profile;
  }, [onLocationCaptured, onLocationReadyChanged, onDeliveryTimeCapture, getCurrentLocationName, onLocationProductsFetch, profile]);

  const isLocationReady = useCallback(() => {
    const ready = !loadingLocation && locationGranted && !!currentUserLocation;
    setPossibleOrderTime(dayjs());
    console.log(`🔍 [Status Check] Readiness Evaluation: ${ready}`);
    return ready;
  }, [loadingLocation, locationGranted, currentUserLocation]);

  useEffect(() => {
    const ready = isLocationReady();
    if (callbacksRef.current.onLocationReadyChanged) {
      callbacksRef.current.onLocationReadyChanged(ready);
    }
  }, [isLocationReady]);

  useEffect(() => {
    let active = true;
    console.log(`🚀 [Effect] Launching pipeline for: "${role}", refetchTrigger: ${refetchTrigger}`);

    const isManualRequest = refetchTrigger > 0;

    // Skip GPS fetch only if autoFetch is off AND this isn't a manual request.
    if (!autoFetch && !isManualRequest) {
      if (existingCoordinates && existingLocationName) {
        setCurrentUserLocation(existingCoordinates);
        setReadableAddress(existingLocationName);
        setLoadingLocation(false);
        setLocationGranted(true);

        callbacksRef.current.onLocationCaptured?.(existingCoordinates);
        callbacksRef.current.onDeliveryTimeCapture?.(deliveryTime ? deliveryTime : 'Soon');
        callbacksRef.current.onLocationReadyChanged?.(true);
      } else {
        // No existing location yet — just show the UI (with a "Set Location" button) without loading.
        setLoadingLocation(false);
        setLocationGranted(true);
        callbacksRef.current.onLocationReadyChanged?.(true);
      }
      return;
    }

    // Skip location request if permission was already denied and this isn't a manual request
    if (permissionDenied && !isManualRequest) {
      console.log(`⏭️ [Effect] Skipping location request - permission already denied`);
      return;
    }

    async function getAutomaticLocation() {
      try {
        if (isManualRequest) {
          setIsRefetching(true);
        } else {
          setLoadingLocation(true);
        }
        setPermissionDenied(false);
        setLocationError(null);

        const { status } = await Location.requestForegroundPermissionsAsync();
        console.log(`🔒 [Permission] Status: "${status}"`);

        if (status === 'denied' || status === 'unsupported') {
          if (active) {
            setPermissionDenied(true);
            setLocationError(status === 'unsupported'
              ? 'This browser cannot access your location. Enter your delivery address manually.'
              : 'Location access is blocked. Enable it in browser settings, then retry.');
          }
          return;
        }

        if (!active) return;
        setLocationGranted(true);

        await Location.enableNetworkProviderAsync().catch(() => { });

        const location = await getAccurateLocation();

        console.log(
          `📍 [Coordinates Captured] Lat: ${location.coords.latitude}, Lng: ${location.coords.longitude}, Accuracy: ±${location.coords.accuracy}m`
        );

        if (!active) return;

        const capturedCoords: Coordinates = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };

        setCurrentUserLocation(capturedCoords);
        setLocationAccuracy(Math.round(location.coords.accuracy ?? 0));

        const result = getLocationName(capturedCoords);
        if (!active) return;

        if (typeof result === 'object' && result?.formattedName) {
          setReadableAddress(result.formattedName);
          getCurrentLocationName?.(result.formattedName);
        } else {
          setReadableAddress('Unknown Location Address');
        }

        console.log('📍 [Captured Location]', capturedCoords);

        if (role === 'seller') {
          callbacksRef.current.onLocationCaptured?.(capturedCoords);
          callbacksRef.current.onDeliveryTimeCapture?.(deliveryTime ? deliveryTime : 'Soon');
        } else if (role === 'buyer') {
          const currentProfile = profileRef.current;
          const targetLat = currentProfile?.coordinates?.shop_latitude;
          const targetLng = currentProfile?.coordinates?.shop_longitude;

          callbacksRef.current.onLocationCaptured?.(capturedCoords);
          callbacksRef.current.onDeliveryTimeCapture?.(deliveryTime ? deliveryTime : 'Soon');

          if (targetLat && targetLng) {
            const sellerCoords: Coordinates = {
              latitude: Number(targetLat),
              longitude: Number(targetLng),
            };

            const calculatedDistance = calculateHaversineDistance(capturedCoords, sellerCoords);
            console.log(`📏 [Haversine Result] ${calculatedDistance.toFixed(2)} km`);
            setDistance(calculatedDistance.toFixed(2));

            // Trigger product fetch for nearby Food & Snacks (within 1km)
            if (calculatedDistance <= 1) {
              callbacksRef.current.onLocationProductsFetch?.(capturedCoords);
            }
          } else {
            // No profile provided (index screen) - trigger for discovery with 0 distance
            // The index screen will handle distance filtering
            callbacksRef.current.onLocationProductsFetch?.(capturedCoords);
          }
        }
      } catch (error) {
        console.error('❌ [Pipeline Crash]:', error);
        if (active) {
          const message = error instanceof Error ? error.message : 'Unable to capture your location. Please retry.';
          setLocationError(message);
          if (error instanceof Location.LocationError && error.code === 'DENIED') setPermissionDenied(true);
          setLocationGranted(false);
        }
      } finally {
        if (active) {
          setLoadingLocation(false);
          setIsRefetching(false);
        }
      }
    }

    getAutomaticLocation();

    return () => {
      active = false;
    };
  }, [role, autoFetch, refetchTrigger, existingCoordinates, existingLocationName, permissionDenied]);

  const handleOpenSettings = useCallback(() => {
    Linking.openSettings();
  }, []);

  const handleRefetchLocation = useCallback(() => {
    setPermissionDenied(false); // Reset permission denied state for manual retry
    setRefetchTrigger((prev) => prev + 1);
  }, []);

  console.log('it is for nearby products', isForNearByProducts)

  console.log('location is denied', permissionDenied);
  console.log('location error', locationError);
  
 return (
  <>
  {loadingLocation && (
      <div className={`flex-1 justify-center items-center ${isForNearByProducts ? 'bg-transparent' : 'bg-sand-50'} 
        ${isForNearByProducts ? 'px-2 py-0.5':'p-4'}
      `}>
        <div className={`bg-white rounded-lg  border border-sand-200 items-center flex-row justify-between ${isForNearByProducts ? 'px-2 py-1 bg-opacity-90' : 'p-6 w-full max-w-sm'}`} style={{ gap: 6 }}>
          <div className="flex-row items-center" style={{ gap: 6 }}>
            <ActivityIndicator size={isForNearByProducts ? "small" : "large"} color="#F59E0B" />
            <p className={`font-semibold text-sand-600 ${isForNearByProducts ? 'text-[10px]':'text-base'}`}>
              {isForNearByProducts ? 'Finding nearby...' : 'Fetching location details...'}
            </p>
          </div>
          {isForNearByProducts && (
            <TouchableOpacity 
              onPress={() => setShowExplanationModal(true)}
              className="w-5 h-5 bg-sand-100 rounded-full items-center justify-center"
            >
              <HelpCircle size={10} color="#1E293B" />
            </TouchableOpacity>
          )}
        </div>
      </div>
    )
  }

   

  {(permissionDenied || locationError) && !loadingLocation && (
    
      <div className={`flex-1 justify-center items-center ${isForNearByProducts ? 'bg-transparent' : 'bg-sand-50'} ${isForNearByProducts ? 'px-2 py-0.5' : 'p-4'}`}>
        <div className={`bg-white rounded-lg  border border-sand-200 items-center ${isForNearByProducts ? 'flex-row justify-between px-2 py-1 bg-opacity-90' : 'p-6 w-full max-w-sm'}`}>
          {isForNearByProducts ? (
            <>
              <div className="flex-row items-center" style={{ gap: 4 }}>
                <div className="w-1.5 h-1.5 rounded-full bg-market-500" />
                <p className="text-[10px] font-semibold text-market-600">
                  Location needed
                </p>
              </div>
              <div className="flex-row items-center" style={{ gap: 4 }}>
                <TouchableOpacity 
                  onPress={() => {
                    setPermissionDenied(false);
                    handleOpenSettings();
                  }} 
                  className="bg-brand-500 px-1.5 py-0.5 rounded"
                >
                  <p className="text-white font-semibold text-[10px]">Enable</p>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => setShowExplanationModal(true)}
                  className="w-5 h-5 bg-sand-100 rounded-full items-center justify-center"
                >
                  <HelpCircle size={10} color="#1E293B" />
                </TouchableOpacity>
              </div>
            </>
          ) : (
            <>
              <div className="w-2 h-2 rounded-full bg-market-500 mb-3" />
              <p className="text-base font-bold text-market-600 text-center mb-1">
                Location Access Needed
              </p>
              <p className="text-sm text-sand-500 text-center leading-relaxed mb-4">
                {locationError || (role === 'seller'
                  ? 'Enable location access so buyers can see your shop on the map.'
                  : 'Enable location access so we can show nearby products and estimate delivery time.')}
              </p>
              <TouchableOpacity 
                onPress={() => {
                  setPermissionDenied(false);
                  handleOpenSettings();
                }} 
                className="bg-brand-500 px-5 py-3 rounded-xl mb-2"
              >
                <p className="text-white font-semibold text-sm">Open Settings</p>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleRefetchLocation} className="px-5 py-2">
                <p className="text-brand-500 font-semibold text-sm">I've granted access — Retry</p>
              </TouchableOpacity>
            </>
          )}
        </div>
      </div>
    
)}


  {isForNearByProducts && !loadingLocation && !permissionDenied && !locationError && (
    <div className="flex-1 justify-center items-center bg-transparent px-2 py-0.5">
      <div className="bg-white rounded-lg  border border-sand-200 items-center flex-row justify-between px-2 py-1 bg-opacity-90" style={{ gap: 8 }}>
        <div className="flex-row items-center" style={{ gap: 4 }}>
          <div className="w-1.5 h-1.5 rounded-full bg-delivery-500" />
          <p className="text-[10px] font-semibold text-sand-600">
            {readableAddress ? readableAddress.substring(0, 20) + (readableAddress.length > 20 ? '...' : '') : 'Location set'}
            {locationAccuracy ? ` · ±${locationAccuracy}m` : ''}
          </p>
        </div>
        <div className="flex-row items-center" style={{ gap: 4 }}>
          <TouchableOpacity 
            onPress={handleRefetchLocation}
            disabled={isRefetching}
            className="w-5 h-5 bg-sand-100 rounded-full items-center justify-center"
            style={{ opacity: isRefetching ? 0.5 : 1 }}
          >
            {isRefetching ? (
              <ActivityIndicator size="small" color="#F59E0B" />
            ) : (
              <RefreshCw size={10} color="#1E293B" />
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setShowExplanationModal(true)}
            className="w-5 h-5 bg-sand-100 rounded-full items-center justify-center"
          >
            <HelpCircle size={10} color="#1E293B" />
          </TouchableOpacity>
        </div>
      </div>
    </div>
  )}

  {!isForNearByProducts && !loadingLocation && !locationError && !permissionDenied && (
    <div className="flex-1 justify-center items-center bg-sand-50 p-4">
      <div className="bg-white p-6 rounded-lg  border border-sand-200 items-center w-full max-w-sm">
        {role === 'seller' ? (
          <>
            <p className="text-sand-500 text-xs font-medium uppercase tracking-wider mb-2">
              Your Registered Shop Location
            </p>
            <div className="flex-row items-center" style={{ gap: 8 }}>
              <Crosshair size={16} className="text-delivery-600" />
              <p className="text-xs font-semibold text-sand-900 text-center">
                {presentLocationName? presentLocationName : readableAddress || 'No location set'}
              </p>
            </div>
            {locationAccuracy ? <p className="text-xs text-sand-500 mt-2">Accurate to approximately ±{locationAccuracy} metres</p> : null}
            <TouchableOpacity
              onPress={handleRefetchLocation}
              disabled={isRefetching}
              className="mt-4 bg-brand-500 px-4 py-2 rounded-xl flex-row items-center"
              style={{ gap: 8, opacity: isRefetching ? 0.6 : 1 }}
            >
              {isRefetching && <ActivityIndicator size="small" color="#fff" />}
              <p className="text-white font-semibold text-xs">
                {isRefetching
                  ? 'Updating...'
                  : currentUserLocation
                    ? 'Update Location'
                    : 'Set Location'}
              </p>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <p className="mb-2 font-jakarta-semibold text-xs text-brand-500">
              {readableAddress}
            </p>
            <DeliveryTime
              distanceKm={Number(distance)}
              orderTime={Number(possibleOrderTime)}
              getDeliveryTime={(deliveryTime: string) => setDeliveryTime(deliveryTime)}
            />
            <TouchableOpacity
              onPress={handleRefetchLocation}
              disabled={isRefetching}
              className="mt-4 bg-brand-500 px-4 py-2 rounded-xl flex-row items-center"
              style={{ gap: 8, opacity: isRefetching ? 0.6 : 1 }}
            >
              {isRefetching && <ActivityIndicator size="small" color="#fff" />}
              <p className="text-white font-semibold text-sm">
                {isRefetching ? 'Updating...' : 'Refresh My Location'}
              </p>
            </TouchableOpacity>
          </>
        )}
      </div>
    </div>
  )}

  {/* Location Explanation Modal */}
  <Modal
    visible={showExplanationModal}
    transparent={true}
    animationType="fade"
    onRequestClose={() => setShowExplanationModal(false)}
  >
    <div className="flex-1 bg-black/50 justify-center items-center px-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-2xl">
        <div className="flex-row justify-between items-center mb-4">
          <p className="text-lg font-bold text-sand-900">Why Location Access?</p>
          <TouchableOpacity onPress={() => setShowExplanationModal(false)}>
            <p className="text-sand-500 text-xl">×</p>
          </TouchableOpacity>
        </div>

        <Scrolldiv className="max-h-80">
          <div>
            <div className="mb-4">
              <p className="font-semibold text-sand-900 mb-1">📍 Find Nearby Products</p>
              <p className="text-sm text-sand-600 leading-relaxed">
                We use your location to show you Food & Snacks products from shops near you, making it easier to find what you need quickly.
              </p>
            </div>

            <div className="mb-4">
              <p className="font-semibold text-sand-900 mb-1">🚚 Accurate Delivery Estimates</p>
              <p className="text-sm text-sand-600 leading-relaxed">
                Your location helps us calculate accurate delivery times and costs, so you know exactly when to expect your order.
              </p>
            </div>

            <div className="mb-4">
              <p className="font-semibold text-sand-900 mb-1">🔄 Refresh Location</p>
              <p className="text-sm text-sand-600 leading-relaxed">
                Use the refresh button to update your location if you've moved, ensuring you always see the most relevant nearby products.
              </p>
            </div>

            <div className="mb-4">
              <p className="font-semibold text-sand-900 mb-1">🔒 Privacy & Security</p>
              <p className="text-sm text-sand-600 leading-relaxed">
                Your location data is only used for finding nearby products and delivery estimates. We never share your precise location with third parties.
              </p>
            </div>
          </div>
        </Scrolldiv>

        <TouchableOpacity
          onPress={() => setShowExplanationModal(false)}
          className="mt-4 bg-brand-500 py-3 rounded-xl items-center"
        >
          <p className="text-white font-semibold">Got it!</p>
        </TouchableOpacity>
      </div>
    </div>
  </Modal>
  </>)
}