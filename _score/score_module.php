<?php
/**
 * Materia
 * It's a thing
 *
 * @package	    Materia
 * @version    1.0
 * @author     UCF New Media
 * @copyright  2011 New Media
 * @link       http://kogneato.com
 */


/**
 * NEEDS DOCUMENTATION
 *
 * The inst managers for the Materia package.
 *
 * @package	    Main
 * @subpackage  scoring
 * @category    Modules
  * @author      ADD NAME HERE
 */

namespace Materia;

class Score_Modules_Labeling extends Score_Module
{

	/** @var unknown NEEDS DOCUMENTATION */
	public $is_case_sensitive;

	private $answers_by_location = [];
	private $related_questions = [];
	private $answer_values = [];

	public function check_answer($log)
	{
		if (isset($this->questions[$log->item_id]))
		{
			if(empty($this->answers_by_location))
			{
				foreach ($this->questions as $q)
				{
					$location = $q->options['endPointX'].','.$q->options['endPointY'];
					if (empty($this->answers_by_location[$location]))
					{
						$this->answers_by_location[$location] = [];
					}
					$this->answers_by_location[$location][] = $q->questions[0]['text'];
				}
				foreach ($this->questions as $q)
				{
					$location = $q->options['endPointX'].','.$q->options['endPointY'];
					$this->related_questions[$q->id] = $this->answers_by_location[$location];
					$this->answer_values[$q->id] = (int)$q->answers[0]['value'];
				}
			}
		}

		$possible_answers = $this->related_questions[$log->item_id];
		return in_array($log->text, $possible_answers) ? $this->answer_values[$log->item_id] : 0;
	}
}