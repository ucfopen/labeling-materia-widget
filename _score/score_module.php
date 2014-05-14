<?php

namespace Materia;

class Score_Modules_Labeling extends Score_Module
{

	protected $_ss_table_headers = ['Question Score', 'Your Answer', 'Correct Labels'];

	public $is_case_sensitive;

	private $answers_by_location = [];
	private $related_answers     = [];
	private $answer_values       = [];


	/**
	 * Loop through all the questions to find where the
	 * another answer may be equivelent to the answer for
	 * a givent question
	 */
	private function cache_related_answers()
	{
		if(empty($this->answers_by_location))
		{
			// build a list of related answers
			foreach ($this->questions as $q)
			{
				$location = $q->options['endPointX'].','.$q->options['endPointY'];
				if (empty($this->answers_by_location[$location]))
				{
					$this->answers_by_location[$location] = [];
				}
				$this->answers_by_location[$location][] = $q->questions[0]['text'];
			}

			// make sure each question has a link to it's related answers
			foreach ($this->questions as $q)
			{
				$location = $q->options['endPointX'].','.$q->options['endPointY'];
				$this->related_answers[$q->id] = $this->answers_by_location[$location];
				$this->answer_values[$q->id]   = (int)$q->answers[0]['value'];
			}
		}
	}

	public function check_answer($log)
	{
		$this->cache_related_answers();

		$possible_answers = $this->related_answers[$log->item_id];
		return in_array($log->text, $possible_answers) ? $this->answer_values[$log->item_id] : 0;
	}

	/**
	 * The same point can be multiple questions/answers.
	 * This checks the possilbe answers for this point
	 * and returns the answer that matches the best
	 * so that it's displayed correctly on the score screen
	 */
	protected function get_ss_expected_answers($log, $question)
	{
		$this->cache_related_answers();

		$possible_answers = $this->related_answers[$log->item_id];
		return implode(', ',$possible_answers);
	}

	public function get_ss_question($log, $question)
	{
		return $question->questions[0]['text'];
	}

	protected function details_for_question_answered($log)
	{
		$q     = $this->questions[$log->item_id];
		$score = $this->check_answer($log);

		return [
			'data' => [
				$this->get_ss_answer($log, $q),
				$this->get_ss_expected_answers($log, $q)
			],
			'data_style'    => ['response', 'answer'],
			'score'         => $score,
			'type'          => $log->type,
			'style'         => $this->get_detail_style($score),
			'tag'           => 'div',
			'symbol'        => '%',
			'graphic'       => 'score',
			'display_score' => true
		];
	}
}