// Gives every new user their own editable copy of the demo "starter" dataset.
// The demo account (TEMPLATE_EMAIL) is the source template; on signup we deep-clone
// its content to the new user (remapping all references to the freshly-created ids),
// so each user owns — and can edit/delete — their own data.
import { User } from "../users/users.model";
import { ExamModule } from "../exam-modules/exam-modules.model";
import { Subject } from "../subjects/subjects.model";
import { Topic } from "../topics/topics.model";
import { Question } from "../questions/questions.model";
import { Book } from "../books/books.model";
import { Job } from "../jobs/jobs.model";
import { Resource } from "../resources/resources.model";
import {
  ImportantSubject,
  ImportantTopic,
} from "../important-topics/important-topics.model";
import { JobApplication } from "../applications/applications.model";
import { StudyPlan } from "../study-plans/study-plans.model";
import { Note } from "../notes/notes.model";

export const TEMPLATE_EMAIL = "demo@lokkho.com";

// Delete all content owned by a user (used to reset before a re-clone).
export async function purgeOwnedContent(userId: any): Promise<void> {
  await Promise.all([
    ExamModule.deleteMany({ createdBy: userId }),
    Subject.deleteMany({ createdBy: userId }),
    Topic.deleteMany({ createdBy: userId }),
    Question.deleteMany({ createdBy: userId }),
    Book.deleteMany({ recommendedBy: userId }),
    Job.deleteMany({ createdBy: userId }),
    Resource.deleteMany({ createdBy: userId }),
    ImportantSubject.deleteMany({ createdBy: userId }),
    ImportantTopic.deleteMany({ createdBy: userId }),
  ]);
}

type IdMap = Record<string, any>;

// Drop Mongo-managed fields so the doc can be re-inserted fresh.
function strip(doc: any) {
  const { _id, __v, createdAt, updatedAt, ...rest } = doc;
  return rest;
}

// Insert clones of `source` (overriding fields via `mapFn`) and return a map
// from each source _id → newly inserted _id (for reference remapping).
async function cloneCollection(model: any, source: any[], mapFn: (d: any) => any): Promise<IdMap> {
  const map: IdMap = {};
  if (!source.length) return map;
  const docs = source.map((d) => ({ ...strip(d), ...mapFn(d) }));
  const inserted = await model.insertMany(docs);
  source.forEach((d, i) => (map[String(d._id)] = inserted[i]._id));
  return map;
}

/**
 * Clone the template user's starter data to `targetUserId`.
 * Idempotent: skips if the user already has modules, or is the template itself.
 */
export async function cloneStarterData(targetUserId: any): Promise<void> {
  const template = await User.findOne({ email: TEMPLATE_EMAIL });
  if (!template) return; // no template seeded yet
  if (String(template._id) === String(targetUserId)) return; // don't clone onto the template
  if (await ExamModule.exists({ createdBy: targetUserId })) return; // already onboarded

  const t = template._id;
  const uid = targetUserId;

  // New users get a tiny starter sample — 1 of each list (module, important-subject,
  // question, book, job, resource, application, planner). The single module is cloned
  // WITH its own subjects/topics so it's usable. The demo account keeps everything
  // (it's the template and is never cloned onto).
  const SAMPLE = 1;

  // Drive the single module off a demo question, so /modules AND /questions both show
  // 1 and the question references a module that actually exists for the user.
  const sampleQ: any = await Question.findOne({ createdBy: t }).lean();

  // ---- Content (owner = createdBy / recommendedBy) ----
  const [modules, subjects, topics, books, jobs, resources, impSubs, impTopics] =
    await Promise.all([
      ExamModule.find(sampleQ ? { _id: sampleQ.moduleId } : { createdBy: t }).limit(SAMPLE).lean(),
      Subject.find({ createdBy: t }).lean(),
      Topic.find({ createdBy: t }).lean(),
      Book.find({ recommendedBy: t }).limit(SAMPLE).lean(),
      Job.find({ createdBy: t }).limit(SAMPLE).lean(),
      Resource.find({ createdBy: t }).limit(SAMPLE).lean(),
      ImportantSubject.find({ createdBy: t }).limit(SAMPLE).lean(),
      ImportantTopic.find({ createdBy: t }).lean(),
    ]);

  const moduleMap = await cloneCollection(ExamModule, modules, () => ({ createdBy: uid }));

  // Subjects/topics cascade to the single cloned module (filtered by its id).
  const validSubjects = subjects.filter((s: any) => moduleMap[String(s.moduleId)]);
  const subjectMap = await cloneCollection(Subject, validSubjects, (s) => ({
    createdBy: uid,
    moduleId: moduleMap[String(s.moduleId)],
  }));

  const validTopics = topics.filter(
    (tp: any) => subjectMap[String(tp.subjectId)] && moduleMap[String(tp.moduleId)]
  );
  const topicMap = await cloneCollection(Topic, validTopics, (tp) => ({
    createdBy: uid,
    subjectId: subjectMap[String(tp.subjectId)],
    moduleId: moduleMap[String(tp.moduleId)],
  }));

  // Just the one sample question (only if its module was cloned).
  const oneQuestion = sampleQ && moduleMap[String(sampleQ.moduleId)] ? [sampleQ] : [];
  await cloneCollection(Question, oneQuestion, (q) => ({
    createdBy: uid,
    moduleId: moduleMap[String(q.moduleId)],
    subjectId: q.subjectId ? subjectMap[String(q.subjectId)] : undefined,
    topicId: q.topicId ? topicMap[String(q.topicId)] : undefined,
  }));

  await cloneCollection(Book, books, (b) => ({
    recommendedBy: uid,
    examModuleId: b.examModuleId ? moduleMap[String(b.examModuleId)] : undefined,
  }));
  await cloneCollection(Job, jobs, () => ({ createdBy: uid }));
  await cloneCollection(Resource, resources, () => ({ createdBy: uid }));

  // 1 important-subject + only its own topics.
  const impSubMap = await cloneCollection(ImportantSubject, impSubs, () => ({ createdBy: uid }));
  const validImpTopics = impTopics.filter((it: any) => it.subjectId && impSubMap[String(it.subjectId)]);
  await cloneCollection(ImportantTopic, validImpTopics, (it) => ({
    createdBy: uid,
    subjectId: impSubMap[String(it.subjectId)],
  }));

  // ---- Personal sample data (owner = userId) ----
  const [apps, plans, notes] = await Promise.all([
    JobApplication.find({ userId: t }).limit(SAMPLE).lean(),
    StudyPlan.find({ userId: t }).limit(SAMPLE).lean(),
    Note.find({ userId: t }).lean(),
  ]);

  await cloneCollection(JobApplication, apps, () => ({ userId: uid }));
  await cloneCollection(StudyPlan, plans, (p) => ({
    userId: uid,
    items: (p.items || []).map((it: any) => ({
      ...it,
      _id: undefined,
      topicId: it.topicId ? topicMap[String(it.topicId)] : undefined,
    })),
  }));
  await cloneCollection(Note, notes, (n) => ({
    userId: uid,
    moduleId: n.moduleId ? moduleMap[String(n.moduleId)] : undefined,
    subjectId: n.subjectId ? subjectMap[String(n.subjectId)] : undefined,
    topicId: n.topicId ? topicMap[String(n.topicId)] : undefined,
  }));
}
