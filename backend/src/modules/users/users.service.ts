import { ApiError } from "../../utils/ApiError";
import { User } from "./users.model";
import { RefreshToken } from "../auth/auth.model";
import { issueTokens } from "../auth/auth.service";
import { UserTopicProgress, UserSubjectProgress } from "../progress/progress.model";
import { Note } from "../notes/notes.model";
import { StudyPlan } from "../study-plans/study-plans.model";
import { MockTestAttempt } from "../mock-tests/mock-tests.model";
import { JobApplication } from "../applications/applications.model";
import { ExamModule } from "../exam-modules/exam-modules.model";
import { Subject } from "../subjects/subjects.model";
import { Topic } from "../topics/topics.model";
import { Question } from "../questions/questions.model";
import { Book } from "../books/books.model";
import { Job } from "../jobs/jobs.model";
import { Resource } from "../resources/resources.model";
import { ImportantSubject, ImportantTopic } from "../important-topics/important-topics.model";

export async function updateProfile(userId: any, name: string) {
  const user = await User.findByIdAndUpdate(userId, { name }, { new: true });
  if (!user) throw ApiError.notFound("User not found");
  return user;
}

export async function changePassword(userId: any, currentPassword: string, newPassword: string) {
  const user = await User.findById(userId).select("+passwordHash");
  if (!user) throw ApiError.notFound("User not found");
  if (!(await user.comparePassword(currentPassword)))
    throw ApiError.badRequest("Current password is incorrect");

  await user.setPassword(newPassword);
  await user.save();

  // Revoke all sessions, then start a fresh one for this device.
  await RefreshToken.deleteMany({ userId: user._id });
  return issueTokens(user);
}

// Delete the account, the user's personal data, AND the content they own
// (each user has their own copy in the personal-workspace model).
export async function deleteAccount(userId: any): Promise<void> {
  await Promise.all([
    // personal data
    UserTopicProgress.deleteMany({ userId }),
    UserSubjectProgress.deleteMany({ userId }),
    Note.deleteMany({ userId }),
    StudyPlan.deleteMany({ userId }),
    MockTestAttempt.deleteMany({ userId }),
    JobApplication.deleteMany({ userId }),
    RefreshToken.deleteMany({ userId }),
    // owned content
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
  await User.findByIdAndDelete(userId);
}
