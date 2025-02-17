import { faMapMarkedAlt } from "@fortawesome/free-solid-svg-icons";
import { Form, Formik } from "formik";
import { FormattedMessage } from "react-intl";
import GeofenceCircle from "../../../../ui/shared/map/geofence/GeofenceCircle";
import Map from "../../../../ui/shared/map/Map";
import MapMove from "../../../../ui/shared/map/MapMove";
import { CircleGeofence, LatLng } from "../../../../ui/shared/map/types";
import Modal from "../../../../ui/shared/modal/Modal";
import FilterModal from "../FilterModal";
import useGeofenceFilter from "./useGeofenceFilter";

interface IGeofenceFilterModal {
  initialMapCenter?: LatLng;
  filterKey: string;
}

export default function GeofenceFilterModal(props: IGeofenceFilterModal) {
  const {
    state,
    handleSubmit,
    close,
    initialValues,
    handleMapMove,
    center,
    zoom
  } = useGeofenceFilter(props.filterKey, props.initialMapCenter);

  return (
    <Modal
      open={state.open}
      close={close}
      className="flex flex-grow max-w-screen-md">
      <Formik<CircleGeofence>
        initialValues={initialValues}
        onSubmit={handleSubmit}>
        {({ values, setValues }) => (
          <Form className="flex flex-grow">
            <FilterModal
              icon={faMapMarkedAlt}
              onCancel={close}
              className="min-w-full flex flex-col">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                <FormattedMessage id="locations.filter.geofence.title" />
              </h3>
              <div className="flex flex-grow mt-4" style={{ height: "400px" }}>
                <Map center={center} zoom={zoom}>
                  <MapMove onMove={handleMapMove} />
                  <GeofenceCircle geofence={values} onChange={setValues} />
                </Map>
              </div>
            </FilterModal>
          </Form>
        )}
      </Formik>
    </Modal>
  );
}
