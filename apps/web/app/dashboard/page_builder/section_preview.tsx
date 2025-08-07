import ComponentRenderer from "@/app/renderer/component_renderer";
import React, { FC } from "react";

const SectionPreView: FC<{
  siteInfo: BrandType;
  data: any;
  auth: AuthModel;
  params?: any;
}> = ({ params, siteInfo, auth, data }) => {
  return (
    <ComponentRenderer
      componentKey={data.key}
      siteInfo={siteInfo}
      user={{}}
      auth={auth}
      preference={data.preferences}
      classes={data.classes}
      component={data}
    />
  );
};

export default SectionPreView;
