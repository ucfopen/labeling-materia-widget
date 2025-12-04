from core.models import LogPlay
from scoring.module import ScoreModule

class Labeling(ScoreModule):

    def __init__(self, play: LogPlay):
        super().__init__(play)
        self._ss_table_headers = ['question score', 'your answer', 'correct labels']

    answers_by_location = {}
    related_answers = {}
    answer_values = {}

    # Loop through all the questions to find where the
	# another answer may be equivelent to the answer for
	# a given question
    def cache_related_answers(self):
        if len(self.answers_by_location) == 0:
            # build a list of related answers
            for q in self.questions:
                location = f'{q.data["options"]["endPointX"]},{q.data["options"]["endPointY"]}'
                if self.answers_by_location.get(location) is None:
                    self.answers_by_location[location] = []
                self.answers_by_location[location].append(q.data["questions"][0]["text"])

            # make sure each question has a link to it's related answers
            for q in self.questions:
                location = f'{q.data["options"]["endPointX"]},{q.data["options"]["endPointY"]}'
                self.related_answers[q.data["id"]] = self.answers_by_location[location]
                self.answer_values[q.data["id"]] = int(q.data["answers"][0]["value"])

    def check_answer(self, log):
        self.cache_related_answers()

        possible_answers = self.related_answers[log.item_id]
        return self.answer_values[log.item_id] if log.text in possible_answers else 0

    # The same point can be multiple questions/answers.
	# This checks the possilbe answers for this point
	# and returns the answer that matches the best
	# so that it's displayed correctly on the score screen
    def get_ss_expected_answers(self, log):
        self.cache_related_answers()

        possible_answers = self.related_answers[log.item_id]
        return ", ".join(possible_answers)
    
    def details_for_question_answered(self, log):
        score = self.check_answer(log)

        return {
            "data": [
                self.get_ss_answer(log, None),
                self.get_ss_expected_answers(log)
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
