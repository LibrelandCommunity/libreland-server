import nsq from 'nsqjs'
import { isMongoId } from './utils';

const sentIds = new Set();

export type NetRequest = {
  ts_iso: string,
  ts: number,
  url: string,
  reqbody: string | null,
  reason: string,
  method: "POST" | "GET",
  reqHeaders: any,
  resHeaders: any,
  resCode: number,
  resText: string,
}

export const mkWriter = async (NSQD_HOST: string, NSQD_PORT: number) => {
  const workWriter = new nsq.Writer(NSQD_HOST, NSQD_PORT)
  workWriter.connect();

  console.log("connecting to writer")
  await new Promise<void>( resolve => workWriter.on('ready', () => resolve()) )
  console.log("writer connected")



  const mkEnqueueFunc = (topic: string) => (id: string) => {
    if (sentIds.has(id)) return;
    sentIds.add(id);

    workWriter.publish(topic, id)
  }

  return {
    enqueueThing: mkEnqueueFunc("al_things"),
    enqueuePlayer: mkEnqueueFunc("al_players"),
    enqueueArea: mkEnqueueFunc("al_areas"),
    enqueueForum: mkEnqueueFunc("al_forum"),
    enqueueThread: mkEnqueueFunc("al_threads"),
    enqueuePlacement: (areaId: string, placementId: string) => workWriter.publish("al_placements", areaId + "," + placementId),
    sendCdnError: (id: string, res: Response) => {
      workWriter.publish("al_cdn_error", JSON.stringify({ id, status: res.status }))
    },
    sendNetRequest: (req: NetRequest) => {
      //console.log(req)
      workWriter.publish("al_requests", JSON.stringify(req))
    }
  }
}


export const mkQueueReader = (topic: string, channel: string, onId: (id: string, msg: nsq.Message) => Promise<void>) => {
  const reader = new nsq.Reader(topic, channel, {
    lookupdHTTPAddresses: '192.168.150.1:4161',
    maxInFlight: 1,
  })

  reader.on('message', async msg => {
    const body = msg.body.toString();
    console.log(`${new Date().toISOString()} [${topic}/${channel}] msg ${msg.id}: "${body}" (attempt #${msg.attempts})`)
    if (isMongoId(body)) {
      try {
        await onId(body, msg)
      } catch(e) {
        console.log(`${new Date().toISOString()} [${topic}/${channel}] msg ${msg.id}: "${body}" error! requeuing`, e)
        msg.requeue()
      }
    }
    else {
      console.log(`${new Date().toISOString()} [${topic}/${channel}] msg ${msg.id}: "${body}" not a mongoid!!!!!!!!!!!!! requeueing`)
      msg.requeue()
    }
  })

  reader.connect()
}
