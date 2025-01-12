import { Elysia } from 'elysia'
import { UserAuthResponseSchema, UserSession } from '../../types/user'
import { userMetadataOps, personMetadataOps } from '../../db'
import { SqliteBoolean } from '../../types/db'

export const createAuthRoutes = () => {
  return new Elysia()
    .post('/auth/start', async ({ cookie: { s }, request, body }: { cookie: { s: any }, request: Request, body: any }) => {
      try {
        const username = body.ast.split("|")[0]
        const password = body.ast.split("|")[1]

        // First check if user exists
        let user = userMetadataOps.findByUsername(username);

        // If no existing user, check if there's a matching person
        if (!user) {
          const person = personMetadataOps.findByScreenName(username);

          const newUserData = {
            username,
            password,
            is_findable: Number(person?.is_findable ?? true) as SqliteBoolean,
            age: person?.age ?? 2226,
            age_secs: 192371963,
            is_soft_banned: Number(person?.is_banned ?? false) as SqliteBoolean,
            show_flag_warning: 0 as SqliteBoolean,
            area_count: 1,
            thing_tag_count: 1,
            all_things_clonable: 1 as SqliteBoolean,
            has_edit_tools: 1 as SqliteBoolean,
            has_edit_tools_permanently: 1 as SqliteBoolean,
            edit_tools_expiry_date: '9999-12-31T23:59:59.999Z',
            is_in_edit_tools_trial: 1 as SqliteBoolean,
            was_edit_tools_trial_activated: 1 as SqliteBoolean,
            custom_search_words: '',
            attachments: '{"0":{"Tid":"58a983128ca4690c104b6404","P":{"x":0,"y":0,"z":-1.4901161193847656e-7},"R":{"x":0,"y":0,"z":0}},"2":{"Tid":"58965e04569548a0132feb5e","P":{"x":-0.07462535798549652,"y":0.17594149708747864,"z":0.13412480056285858},"R":{"x":87.7847671508789,"y":73.62593841552734,"z":99.06474304199219}},"6":{"Tid":"58a25965b5fa68ae13841fb7","P":{"x":-0.03214322030544281,"y":-0.028440749272704124,"z":-0.3240281939506531},"R":{"x":306.4596862792969,"y":87.87753295898438,"z":94.79550170898438}},"7":{"Tid":"58965dfd9e2733c413d68d05","P":{"x":0.0267937108874321,"y":-0.03752899169921875,"z":-0.14691570401191711},"R":{"x":337.77911376953125,"y":263.3216857910156,"z":78.18708038330078}}}',
            achievements: [30, 7, 19, 4, 20, 11, 10, 5, 9, 17, 13, 12, 16, 37, 34, 35, 44, 31, 15, 27, 28],
            person_id: person?.id,
            status_text: person?.status_text ?? 'exploring around'
          };

          try {
            user = await userMetadataOps.insert(newUserData);
          } catch (e) {
            console.error("Error creating user:", e);
            return new Response("Error processing auth start request", { status: 500 });
          }
        }

        // Set session cookie with user ID and username
        const session: UserSession = {
          id: user.id,
          username: user.username
        };
        s.value = JSON.stringify(session);
        s.httpOnly = true;

        console.log("Logged in user", user.username);

        const response = {
          vMaj: 188,
          vMinSrv: 1,
          personId: user.id,
          homeAreaId: '5773cf9fbdee942c18292f08', // sunbeach
          screenName: user.username,
          statusText: user.status_text,
          isFindable: Boolean(user.is_findable),
          age: user.age,
          ageSecs: user.age_secs,
          attachments: user.attachments,
          isSoftBanned: Boolean(user.is_soft_banned),
          showFlagWarning: Boolean(user.show_flag_warning),
          flagTags: [],
          areaCount: user.area_count,
          thingTagCount: user.thing_tag_count,
          allThingsClonable: Boolean(user.all_things_clonable),
          achievements: user.achievements,
          hasEditTools: Boolean(user.has_edit_tools),
          hasEditToolsPermanently: Boolean(user.has_edit_tools_permanently),
          editToolsExpiryDate: user.edit_tools_expiry_date,
          isInEditToolsTrial: Boolean(user.is_in_edit_tools_trial),
          wasEditToolsTrialEverActivated: Boolean(user.was_edit_tools_trial_activated),
          customSearchWords: user.custom_search_words
        };

        return UserAuthResponseSchema.parse(response);
      } catch (e) {
        console.error("Error processing auth start request:", e)
        return new Response("Error processing auth start request", { status: 500 })
      }
    })
    .post("/p", () => ({ "vMaj": 188, "vMinSrv": 1 }))
}