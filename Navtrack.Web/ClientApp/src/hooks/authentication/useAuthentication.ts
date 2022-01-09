import { add, isAfter, parseISO, sub } from "date-fns";
import { useCallback, useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { AUTHENTICATION } from "../../constants";
import { authenticationAtom } from "../../state/app.authentication";
import { localStorageAtom } from "../../state/app.localStorage";
import { log } from "../../utils/log";
import { useGetTokenMutation } from "../mutations/useGetTokenMutation";

export const useAuthentication = () => {
  const [authentication, setAuthentication] =
    useRecoilState(authenticationAtom);
  const [localStorageState, setLocalStorageState] =
    useRecoilState(localStorageAtom);
  const [reinitializeCheckInterval, setReinitializeCheckInterval] =
    useState(false);
  const [checkTokenInterval, setCheckTokenInterval] = useState<
    NodeJS.Timeout | undefined
  >();

  const refreshTokenMutation = useGetTokenMutation({
    onSuccess: (data) => {
      const expiryDate = add(new Date(), {
        seconds: data.expires_in
      });

      if (authentication.initialized) {
        setReinitializeCheckInterval(true);
      }

      setAuthentication((x) => ({
        ...x,
        isAuthenticated: true,
        initialized: true,
        token: {
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          expiryDate: expiryDate.toISOString()
        }
      }));
    },
    onError: () => {
      setAuthentication((x) => ({
        ...x,
        initialized: true,
        isAuthenticated: false,
        token: undefined
      }));
    }
  });

  const checkToken = useCallback(() => {
    if (authentication.recheckToken) {
      setAuthentication((x) => ({
        ...x,
        recheckToken: false
      }));
    }

    if (authentication.token) {
      log("[TOKEN REFRESH] Checking");

      const expiryDate = sub(parseISO(authentication.token.expiryDate), {
        minutes: 2
      });

      if (isAfter(new Date(), expiryDate)) {
        log(
          "[TOKEN REFRESH] Token expired, refreshing token",
          authentication.token.expiryDate
        );

        const data = {
          grant_type: "refresh_token",
          client_id: AUTHENTICATION.CLIENT_ID,
          refresh_token: authentication.token?.refreshToken
        };

        refreshTokenMutation.mutate(data);
      } else {
        log("[TOKEN REFRESH] Token valid", authentication.token.expiryDate);

        if (!authentication.isAuthenticated) {
          setAuthentication((x) => ({
            ...x,
            initialized: true,
            isAuthenticated: true
          }));
        }
      }
    }
  }, [
    authentication.isAuthenticated,
    authentication.recheckToken,
    authentication.token,
    refreshTokenMutation,
    setAuthentication
  ]);

  const setCheckInterval = useCallback(() => {
    const interval = setInterval(() => {
      checkToken();
    }, 10000);
    setCheckTokenInterval(interval);
  }, [checkToken]);

  // If the user is authenticated, set the interval to check the token
  useEffect(() => {
    if (authentication.isAuthenticated && !checkTokenInterval) {
      log("[TOKEN REFRESH] Setting interval");
      setCheckInterval();
    }
  }, [authentication.isAuthenticated, checkTokenInterval, setCheckInterval]);

  // If the user logs out, clear the interval
  useEffect(() => {
    if (!authentication.isAuthenticated && checkTokenInterval) {
      log("[TOKEN REFRESH] Stopping");
      clearInterval(checkTokenInterval);
      setCheckTokenInterval(undefined);
    }
  }, [authentication.isAuthenticated, checkTokenInterval]);

  // If the expiry date changes, clear the interval and set a new one
  useEffect(() => {
    if (reinitializeCheckInterval && checkTokenInterval) {
      log("[TOKEN REFRESH] Reinitializing");
      setReinitializeCheckInterval(false);
      clearInterval(checkTokenInterval);
      setCheckInterval();
    }
  }, [checkTokenInterval, reinitializeCheckInterval, setCheckInterval]);

  // Recheck the token on trigger
  useEffect(() => {
    if (authentication.recheckToken) {
      checkToken();
    }
  }, [authentication.recheckToken, checkToken]);

  // Get the token from local storage
  useEffect(() => {
    if (
      !authentication.initialized &&
      localStorageState.initialized &&
      localStorageState.data?.token !== undefined
    ) {
      setAuthentication((x) => ({
        ...x,
        token: localStorageState.data?.token,
        recheckToken: true
      }));
    } else {
      setAuthentication((x) => ({
        ...x,
        initialized: true
      }));
    }
  }, [
    authentication.initialized,
    localStorageState.data?.token,
    localStorageState.initialized,
    setAuthentication
  ]);

  // Update the local storage when the token changes
  useEffect(() => {
    if (authentication.initialized && localStorageState.initialized) {
      setLocalStorageState((x) => ({
        ...x,
        data: {
          ...x.data,
          token: authentication.token
        }
      }));
    }
  }, [
    authentication.initialized,
    authentication.token,
    localStorageState.initialized,
    setLocalStorageState
  ]);
};
