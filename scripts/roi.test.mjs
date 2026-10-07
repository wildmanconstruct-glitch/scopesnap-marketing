import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';

// Exercise the published calculator, including its slider and team controls.
const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const source = html.match(/\/\/ ROI calculator\n([\s\S]*?)\/\/ Voice section tab toggle/)[1];
function calculator() {
  const nodes = new Map();
  function node(id) {
    if (!nodes.has(id)) nodes.set(id, {
      value: '10', textContent: '', innerHTML: '', style: {}, handlers: {},
      addEventListener(event, fn) { this.handlers[event] = fn; },
    });
    return nodes.get(id);
  }
  const window = {};
  vm.runInNewContext(source, { window, document: { getElementById: node, querySelectorAll: () => [] } });
  return {
    node,
    update(jobs, seats = 1, rate = 75) {
      node('roiSlider').value = String(jobs);
      const button = dataset => ({ dataset, classList: { add() {} } });
      window.setRoiTeam(button({ seats: String(seats) }));
      window.setRoiRate(button({ rate: String(rate) }));
      node('roiSlider').handlers.input();
    },
  };
}

for (const [jobs, seats, plan, cost, packs] of [
  [10, 1, 'Solo', 59, 0], [11, 1, 'Professional', 119, 0],
  [25, 1, 'Professional', 119, 0], [26, 1, 'Business', 249, 0],
  [50, 1, 'Business', 249, 0], [51, 1, 'Business', 308, 1],
  [60, 1, 'Business', 308, 1], [8, 3, 'Professional', 119, 0],
  [9, 3, 'Business', 249, 0], [20, 3, 'Business', 308, 1],
  [21, 3, 'Business', 367, 2], [50, 3, 'Business', 839, 10],
  [51, 3, 'Enterprise', null, 0], [1, 8, 'Business', 249, 0],
  [19, 8, 'Enterprise', null, 0], [1, 9, 'Enterprise', null, 0],
]) {
  test(`${jobs} jobs/person × ${seats} seats recommends ${plan} at ${cost ?? 'custom'} pricing`, () => {
    const c = calculator(); c.update(jobs, seats);
    assert.equal(c.node('roiPlan').textContent, plan);
    if (cost === null) {
      assert.equal(c.node('roiBreakeven').style.display, 'none');
      assert.match(c.node('roiPlanLabel').innerHTML, /talk to us/);
    } else {
      assert.equal(c.node('roiBreakeven').style.display, '');
      assert.ok(c.node('roiBreakeven').textContent.includes(`$${cost}/month`));
      if (packs) {
        assert.ok(c.node('roiPlanLabel').innerHTML.includes(`${packs} extra-job`));
        assert.ok(c.node('roiBreakeven').textContent.includes(`${packs * 10} extra jobs/month`));
      } else assert.equal(c.node('roiPlanLabel').innerHTML, 'Suggested plan');
    }
  });
}

test('break-even includes packs and resets when returning to a smaller plan', () => {
  const c = calculator();
  c.update(60, 1, 50);
  assert.match(c.node('roiBreakeven').textContent, /across 4 jobs.*\$308\/month/);
  assert.equal(c.node('roiHrs').textContent, '90–120 hrs');
  c.update(60, 8);
  assert.equal(c.node('roiBreakeven').style.display, 'none');
  c.update(10);
  assert.equal(c.node('roiPlan').textContent, 'Solo');
  assert.equal(c.node('roiPlanLabel').innerHTML, 'Suggested plan');
  assert.equal(c.node('roiBreakeven').style.display, '');
  assert.match(c.node('roiBreakeven').textContent, /\$59\/month base plan/);
});
