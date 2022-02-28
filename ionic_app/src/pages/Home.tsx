import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonCard, IonCardSubtitle, IonCardTitle, IonCardHeader, IonCardContent, useIonViewWillEnter, IonIcon, IonGrid, IonCol, IonRow, IonButton, IonText, IonChip, IonLabel, IonItemDivider, IonModal, IonBackdrop, IonButtons, IonBackButton, useIonToast, useIonViewWillLeave, IonSkeletonText } from '@ionic/react';
import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import styles from "./home.module.scss";
//import ionic icons
import { pulseOutline, informationCircleOutline, cubeOutline, calculatorOutline } from 'ionicons/icons';

let socket = io('http://localhost:6556')

interface Props {
  router: HTMLIonRouterOutletElement | null;
}

const Home: React.FC<Props> = ({ router }) => {
  const [present, dismiss] = useIonToast();
  const [data, setData] = useState([]);
  const [logs, setLogs] = useState(String);
  const [showModal, setShowModal] = useState(false);
  socket.on('data', (response) => {
    //console.log(JSON.stringify(response, null, 3))
    console.log('received data', response)

    setData(response)
  });

  socket.on('restarted', (name: string) => {
    console.log('restarted', name)
    present({
      message: `${name} has been restarted`,
      duration: 2500,
      position: 'top'
    })
  });

  if (router) alert('no router')

  function triggerModal(idx: any) {
    setLogs(data[idx]['log'])
    setShowModal(true)
  }

  function restartInstance(name: string) {
    socket.emit('restart', name)
  }

  useIonViewWillEnter(() => {
    //console.log('ionViewWillEnter event fired');
    let interval = setInterval(() => {
      socket.emit('data')
    }, 1000 * 2.5)
    //todo clear when app closed
  });

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Dashboard</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Dashboard</IonTitle>
          </IonToolbar>
        </IonHeader>
        {data.length > 0 ? data.map((item, index) => {
          let restarts = item['restart_time']
          let name = item['name']
          let uptime = +Number((new Date().getTime() - +item['uptime']) / 1000 / 60 / 60).toFixed(1)
          return <IonCard class="welcome-card">
            <IonCardHeader className={styles.cardHeader}>
              <IonCardSubtitle className={item['status'] === 'online' ? styles.green : styles.red}>{item['status']}</IonCardSubtitle>
              <IonCardTitle className={styles.pm2Name}>{item['name']}</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonGrid>
                <IonRow>
                  <IonCol className={styles.ionColData}>
                    <div className={styles.colDiv}>
                      <IonIcon icon={pulseOutline} />
                      <IonLabel> Uptime</IonLabel>
                      <h1>{uptime}h</h1>
                    </div>
                  </IonCol>
                  <IonCol className={styles.ionColData}>
                    <div className={styles.colDiv}>
                      <IonIcon icon={informationCircleOutline} />
                      <IonLabel> Version</IonLabel>
                      <h1>{item['version']}</h1>
                    </div>
                  </IonCol>
                  <IonCol className={styles.ionColData}>
                    <div className={styles.colDiv}>
                      <IonIcon icon={cubeOutline} />
                      <IonLabel> Memory</IonLabel>
                      <h1>{Number(item['memory'] / 1024 / 1024).toFixed(0)}MB</h1>
                    </div>
                  </IonCol>
                  <IonCol className={styles.ionColData}>
                    <div className={styles.colDiv}>
                      <IonIcon icon={calculatorOutline} />
                      <IonLabel> CPU</IonLabel>
                      <h1>{item['monit']['cpu']}%</h1>
                    </div>
                  </IonCol>
                </IonRow>
                <IonRow className={styles.btnRow}>
                  <IonCol>
                    <IonButton expand={"full"} id="modalTrigger" onClick={() => triggerModal(index)}>View Logs</IonButton>
                  </IonCol>
                  <IonCol>
                    <IonButton color={"danger"} expand={"full"} onClick={() => restartInstance(name)}>Restart</IonButton>
                  </IonCol>
                </IonRow>
              </IonGrid>
            </IonCardContent>
          </IonCard>
        }) : <IonCard class="welcome-card">
        <IonCardHeader className={styles.cardHeader}>
          <IonCardSubtitle className={styles.red}><IonSkeletonText animated /></IonCardSubtitle>
          <IonCardTitle className={styles.pm2Name}><IonSkeletonText animated /></IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <IonGrid>
            <IonRow>
              <IonCol className={styles.ionColData}>
                <div className={styles.colDiv}>
                  <IonIcon icon={pulseOutline} />
                  <IonLabel> Uptime</IonLabel>
                  <h1><IonSkeletonText animated /></h1>
                </div>
              </IonCol>
              <IonCol className={styles.ionColData}>
                <div className={styles.colDiv}>
                  <IonIcon icon={informationCircleOutline} />
                  <IonLabel> Version</IonLabel>
                  <h1><IonSkeletonText animated /></h1>
                </div>
              </IonCol>
              <IonCol className={styles.ionColData}>
                <div className={styles.colDiv}>
                  <IonIcon icon={cubeOutline} />
                  <IonLabel> Memory</IonLabel>
                  <h1><IonSkeletonText animated /></h1>
                </div>
              </IonCol>
              <IonCol className={styles.ionColData}>
                <div className={styles.colDiv}>
                  <IonIcon icon={calculatorOutline} />
                  <IonLabel> CPU</IonLabel>
                  <h1><IonSkeletonText animated /></h1>
                </div>
              </IonCol>
            </IonRow>
            <IonRow className={styles.btnRow}>
              <IonCol>
                <IonButton expand={"full"} id="modalTrigger" disabled>View Logs</IonButton>
              </IonCol>
              <IonCol>
                <IonButton color={"danger"} expand={"full"} disabled>Restart</IonButton>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonCardContent>
      </IonCard>}
        <IonModal
          isOpen={showModal}
          swipeToClose={true}
          presentingElement={router || undefined}
          onDidDismiss={() => setShowModal(false)}
          initialBreakpoint={0.75}
        >
          <IonContent>
            <IonToolbar>
              <IonTitle>View Logs</IonTitle>
            </IonToolbar>
            <IonGrid className={styles.modalContent}>
              <IonRow>{logs}</IonRow>
            </IonGrid>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default Home;
