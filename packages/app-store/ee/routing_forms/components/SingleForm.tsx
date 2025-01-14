import { App_RoutingForms_Form } from "@prisma/client";
import { useRouter } from "next/router";
import { useForm, UseFormReturn } from "react-hook-form";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
import { Icon } from "@calcom/ui";
import { Form } from "@calcom/ui/form/fields";
import { showToast } from "@calcom/ui/v2";
import { ButtonGroup, TextAreaField, TextField, Tooltip, DropdownMenuSeparator, Button } from "@calcom/ui/v2";
import Meta from "@calcom/ui/v2/core/Meta";
import { ShellMain } from "@calcom/ui/v2/core/Shell";
import Banner from "@calcom/ui/v2/core/banner";

import { SerializableForm } from "../types/types";
import { FormAction, FormActionsDropdown, FormActionsProvider } from "./FormActions";
import RoutingNavBar from "./RoutingNavBar";

type RoutingForm = SerializableForm<App_RoutingForms_Form>;
type RoutingFormWithResponseCount = RoutingForm & {
  _count: {
    responses: number;
  };
};

const Actions = ({
  form,
  mutation,
}: {
  form: RoutingFormWithResponseCount;
  mutation: {
    isLoading: boolean;
  };
}) => {
  const { t } = useLocale();
  return (
    <div className="flex items-center">
      <div className="hidden md:inline-flex md:items-center ">
        <FormAction
          className="self-center border-r-2 border-gray-300 pr-5 "
          data-testid="toggle-form"
          action="toggle"
          routingForm={form}
        />
      </div>
      <ButtonGroup
        combined
        containerProps={{ className: "px-4 border-gray-300 hidden md:inline-flex items-center" }}>
        <Tooltip content={t("preview")}>
          <FormAction
            routingForm={form}
            color="secondary"
            target="_blank"
            size="icon"
            type="button"
            rel="noreferrer"
            action="preview"
            StartIcon={Icon.FiExternalLink}
            combined
          />
        </Tooltip>
        <FormAction
          routingForm={form}
          action="copyLink"
          color="secondary"
          size="icon"
          type="button"
          StartIcon={Icon.FiLink}
          tooltip={t("copy_link")}
          combined
        />
        <Tooltip content="Download Responses">
          <FormAction
            data-testid="download-responses"
            routingForm={form}
            action="download"
            color="secondary"
            size="icon"
            type="button"
            StartIcon={Icon.FiDownload}
            combined
          />
        </Tooltip>
        <FormAction
          routingForm={form}
          action="embed"
          color="secondary"
          size="icon"
          StartIcon={Icon.FiCode}
          tooltip={t("embed")}
          combined
        />
        <FormAction
          routingForm={form}
          action="_delete"
          // className="mr-3"
          size="icon"
          StartIcon={Icon.FiTrash}
          color="secondary"
          type="button"
          tooltip={t("delete")}
          combined
        />
      </ButtonGroup>
      <div className="flex md:hidden">
        <FormActionsDropdown form={form}>
          <FormAction
            routingForm={form}
            color="minimal"
            target="_blank"
            type="button"
            rel="noreferrer"
            action="preview"
            StartIcon={Icon.FiExternalLink}
            combined>
            Preview
          </FormAction>
          <FormAction
            action="copyLink"
            className="w-full"
            routingForm={form}
            color="minimal"
            type="button"
            StartIcon={Icon.FiCopy}>
            {t("copy")}
          </FormAction>
          <FormAction
            action="download"
            routingForm={form}
            className="w-full"
            color="minimal"
            type="button"
            StartIcon={Icon.FiDownload}>
            Download Responses
          </FormAction>
          <FormAction
            action="download"
            routingForm={form}
            className="w-full"
            color="minimal"
            type="button"
            StartIcon={Icon.FiDownload}>
            Download Responses
          </FormAction>
          <FormAction
            action="embed"
            routingForm={form}
            color="minimal"
            type="button"
            className="w-full"
            StartIcon={Icon.FiCode}>
            {t("embed")}
          </FormAction>
          <FormAction
            action="_delete"
            routingForm={form}
            className="w-full"
            type="button"
            color="destructive"
            StartIcon={Icon.FiTrash}>
            {t("delete")}
          </FormAction>
          <DropdownMenuSeparator className="h-px bg-gray-200" />
          <div className="inline-flex items-center">
            <Button color="minimal">
              <FormAction
                className="self-center"
                action="toggle"
                label={form.disabled ? "Enable Form" : "Disable Form"}
                routingForm={form}
              />
            </Button>
          </div>
        </FormActionsDropdown>
      </div>
      <div className="mr-4 h-5 border-0 border-gray-300 md:border-l-2" />
      <Button data-testid="update-form" loading={mutation.isLoading} type="submit" color="primary">
        {t("save")}
      </Button>
    </div>
  );
};

export default function SingleForm({
  form,
  appUrl,
  Page,
}: {
  form: RoutingFormWithResponseCount;
  appUrl: string;
  Page: React.FC<{
    form: RoutingFormWithResponseCount;
    appUrl: string;
    hookForm: UseFormReturn<RoutingFormWithResponseCount>;
  }>;
}) {
  const hookForm = useForm({
    defaultValues: form,
  });
  const utils = trpc.useContext();
  const router = useRouter();

  const mutation = trpc.useMutation("viewer.app_routing_forms.form", {
    onSuccess() {
      router.replace(router.asPath);
      showToast("Form updated successfully.", "success");
    },
    onError() {
      showToast(`Something went wrong`, "error");
    },
    onSettled() {
      utils.invalidateQueries(["viewer.app_routing_forms.form"]);
    },
  });
  return (
    <Form
      form={hookForm}
      handleSubmit={(data) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        mutation.mutate({
          ...data,
        });
      }}>
      <FormActionsProvider appUrl={appUrl}>
        <Meta title={form.name} description={form.description || ""} />
        <ShellMain
          heading={form.name}
          subtitle={form.description || ""}
          backPath={`/${appUrl}/forms`}
          CTA={<Actions form={form} mutation={mutation} />}>
          <div className="-mx-4 px-4 sm:px-6 md:-mx-8 md:px-8">
            <div className="flex flex-col items-center md:flex-row md:items-start">
              <div className="min-w-72 max-w-72 mb-6 md:mr-6">
                <TextField
                  type="text"
                  containerClassName="mb-6"
                  placeholder="Title"
                  {...hookForm.register("name")}
                />
                <TextAreaField
                  rows={3}
                  id="description"
                  data-testid="description"
                  placeholder="Form Description"
                  {...hookForm.register("description")}
                  defaultValue={form.description || ""}
                />
                {!form._count?.responses && (
                  <Banner
                    className="mt-6"
                    variant="neutral"
                    title="No Responses yet"
                    description="Wait for some time for responses to be collected. You can go and submit the form yourself as well."
                    Icon={Icon.FiInfo}
                    onDismiss={() => console.log("dismissed")}
                  />
                )}
              </div>
              <div className="w-full rounded-md border border-gray-200 p-8">
                <RoutingNavBar appUrl={appUrl} form={form} />
                <Page hookForm={hookForm} form={form} appUrl={appUrl} />
              </div>
            </div>
          </div>
        </ShellMain>
      </FormActionsProvider>
    </Form>
  );
}
