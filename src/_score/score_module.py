from scoring.module import ScoreModule


class Labeling(ScoreModule):

    def __init__(self, play=None):
        super().__init__(play)

        self._ss_table_headers = [
            "Question Score", "Your Answer", "Correct Labels"
        ]
        self.is_case_sensitive = None

        self.answers_by_location = {}
        self.related_answers = {}
        self.answer_values = {}

    def cache_related_answers(self):
        """
        Loop through all the questions to find where the
        another answer may be equivalent to the answer for
        a given question
        """
        if not self.answers_by_location:
            # build a list of related answers
            for q in self.questions:
                location = f"{q.data["options"]["endPointX"]},{q.data["options"]["endPointY"]}"
                if location not in self.answers_by_location:
                    self.answers_by_location[location] = []
                answer_text = q.data["questions"][0]["text"]
                self.answers_by_location[location].append(answer_text)

            # make sure each question has a link to it"s related answers
            for q in self.questions:
                location = f"{q.data["options"]["endPointX"]},{q.data["options"]["endPointY"]}"
                self.related_answers[q.item_id] = self.answers_by_location[location]
                self.answer_values[q.item_id] = int(q.data["answers"][0]["value"])

    def check_answer(self, log):
        self.cache_related_answers()

        possible_answers = self.related_answers[log.item_id]
        if log.text in possible_answers:
            return self.answer_values[log.item_id]
        else:
            return 0

    def get_ss_expected_answers(self, log, question):
        """
        The same point can be multiple questions/answers.
        This checks the possible answers for this point
        and returns the answer that matches the best
        so that it"s displayed correctly on the score screen
        """
        self.cache_related_answers()

        possible_answers = self.related_answers[log.item_id]
        return ", ".join(possible_answers)

    def get_ss_question(self, log, question):
        return question.data["questions"][0]["text"]

    def details_for_question_answered(self, log):
        q = self.get_question_by_item_id(log.item_id)
        score = self.check_answer(log)

        return {
            "data": [
                self.get_ss_answer(log, q),
                self.get_ss_expected_answers(log, q)
            ],
            "data_style": ["response", "answer"],
            "score": score,
            "type": log.log_type,
            "style": self.get_detail_style(score),
            "tag": "div",
            "symbol": "%",
            "graphic": "score",
            "display_score": True
        }
