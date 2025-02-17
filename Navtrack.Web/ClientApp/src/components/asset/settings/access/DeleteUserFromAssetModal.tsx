import { FormattedMessage } from "react-intl";
import DeleteModal from "../../../ui/shared/modal/DeleteModal";
import useNotification from "../../../ui/shared/notification/useNotification";
import { AssetUserModel } from "@navtrack/navtrack-app-shared/dist/api/model/generated";
import {
  getError,
  useCurrentAsset,
  useDeleteUserFromAssetMutation
} from "@navtrack/navtrack-app-shared";

interface IDeleteAssetModal {
  user?: AssetUserModel;
  show: boolean;
  close: () => void;
  refresh: () => void;
}

export default function DeleteUserFromAssetModal(props: IDeleteAssetModal) {
  const currentAsset = useCurrentAsset();
  const mutation = useDeleteUserFromAssetMutation();
  const { showNotification } = useNotification();

  return (
    <DeleteModal
      open={props.show}
      close={props.close}
      onConfirm={() => {
        if (currentAsset && props.user) {
          mutation.mutate(
            { assetId: currentAsset?.id, userId: props.user.userId },
            {
              onSuccess: () => {
                props.refresh();
              },
              onError: (error) => {
                const model = getError(error);
                showNotification({
                  type: "error",
                  description: `${model.message}`
                });
              }
            }
          );
          props.close();
        }
      }}>
      <h3 className="text-lg font-medium leading-6 text-gray-900">
        <FormattedMessage id="shared.delete-modal.title" />
      </h3>
      <p className="mt-2 text-sm">
        <FormattedMessage
          id="assets.settings.access.delete-user.question"
          values={{
            email: <span className="font-bold">{props.user?.email}</span>,
            assetName: <span className="font-bold">{currentAsset?.name}</span>
          }}
        />
      </p>
    </DeleteModal>
  );
}
