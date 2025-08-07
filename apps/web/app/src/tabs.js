import { Navigate, Route } from "react-router-dom";
import {
  IonRouterOutlet,
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
} from "@ionic/core";
import { cog, flash, list } from "ionicons/icons";

import NoData from "@/app/no_data";

const Tabs = () => {
  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route
          path="/tabs/feed"
          render={() => <NoData text={""} />}
          exact={true}
        />
        <Route
          path="/tabs/lists"
          render={() => <NoData text={""} />}
          exact={true}
        />
        <Route
          path="/tabs/lists/:listId"
          render={() => <NoData text={""} />}
          exact={true}
        />
        <Route
          path="/tabs/settings"
          render={() => <NoData text={""} />}
          exact={true}
        />
        <Route
          path="/tabs"
          render={() => <Navigate to="/tabs/feed" />}
          exact={true}
        />
      </IonRouterOutlet>
      <IonTabBar slot="bottom">
        <IonTabButton tab="tab1" href="/tabs/feed">
          <IonIcon icon={flash} />
          <IonLabel>Feed</IonLabel>
        </IonTabButton>
        <IonTabButton tab="tab2" href="/tabs/lists">
          <IonIcon icon={list} />
          <IonLabel>Lists</IonLabel>
        </IonTabButton>
        <IonTabButton tab="tab3" href="/tabs/settings">
          <IonIcon icon={cog} />
          <IonLabel>Settings</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
};

export default Tabs;
