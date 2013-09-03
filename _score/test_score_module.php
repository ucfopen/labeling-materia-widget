<?php
/**
 * @group App
 * @group Materia
 * @group Score
 * @group Labeling
 */
class Test_Score_Modules_Labeling extends \Basetest
{

	protected function _get_qset()
	{
		return json_decode('
			{
				"items":
				[
					{
						"name":"",
						"items":
						[
							{
								"id":0,
								"type":"QA",
								"questions":
								[
									{
										"text":"eyes"
									}
								],
								"answers":
								[
									{
										"value":100,
										"text":"eyes"
									}
								],
								"options":
								{
									"labelBoxY":274,
									"endPointX":450,
									"labelBoxX":235,
									"endPointY":240
								},
								"assets":[]
							},
							{
								"id":0,
								"type":"QA",
								"questions":
								[
									{
										"text":"mouth"
									}
								],
								"answers":
								[
									{
										"value":100,
										"text":"mouth"
									}
								],
								"options":
								{
									"labelBoxY":314,
									"endPointX":486,
									"labelBoxX":610,
									"endPointY":310
								},
								"assets":[]
							},
							{
								"id":0,
								"type":"QA",
								"questions":
								[
									{
										"text":"feet"
									}
								],
								"answers":
								[
									{
										"value":100,
										"text":"feet"
									}
								],
								"options":
								{
									"labelBoxY":542,
									"endPointX":556,
									"labelBoxX":627,
									"endPointY":497
								},
								"assets":[]
							}
						],
						"options":[],
						"assets":[]
					}
				],
				"options":
				{
					"imageY":40,
					"version":2,
					"imageX":143,
					"imageScale":1,
					"backgroundTheme":"themeCorkBoard"
				},
				"assets":
				[
					"poCFE"
				]
			}
		');
	}

	protected function _make_widget()
	{
		$this->_asAuthor();

		$title = 'LABELING SCORE MODULE TEST';
		$widget_id = $this->_find_widget_id('Labeling');
		$qset = (object) ['version' => 1, 'data' => $this->_get_qset()];
		return \Materia\Api::widget_instance_save($widget_id, $title, $qset, false);
	}

	public function test_check_answer()
	{
		$inst = $this->_make_widget();
		$play_session = \Materia\Api::session_play_create($inst->id);
		$qset = \Materia\Api::question_set_get($inst->id, $play_session);
		$logs = array();

		// will be right
		$logs[] = json_decode('{
			"text":"eyes",
			"type":1004,
			"value":"'.$qset->data['items'][0]['items'][0]['answers'][0]['id'].'",
			"item_id":"'.$qset->data['items'][0]['items'][0]['id'].'",
			"game_time":10
		}');

		// will be wrong
		$logs[] = json_decode('{
			"text":"feet",
			"type":1004,
			"value":"'.$qset->data['items'][0]['items'][1]['answers'][0]['id'].'",
			"item_id":"'.$qset->data['items'][0]['items'][1]['id'].'",
			"game_time":10
		}');

		// will be wrong
		$logs[] = json_decode('{
			"text":"mouth",
			"type":1004,
			"value":"'.$qset->data['items'][0]['items'][2]['answers'][0]['id'].'",
			"item_id":"'.$qset->data['items'][0]['items'][2]['id'].'",
			"game_time":10
		}');

		$logs[] = json_decode('{
			"text":"",
			"type":2,
			"value":"",
			"item_id":0,
			"game_time":12
		}');
		$output = \Materia\Api::play_logs_save($play_session, $logs);

		$scores = \Materia\Api::widget_instance_scores_get($inst->id);

		$this_score = \Materia\Api::widget_instance_play_scores_get($play_session);

		$this->assertInternalType('array', $this_score);
		$this->assertEquals(33.333333333333, $this_score[0]['overview']['score']);
	}
}