import {
  priorityClass,
  statusClass,
  situationClass,
  situationColor,
  unitStatusColor,
  unitTypeColor,
  priorityColor,
  MOCK_DISPATCHER,
  MOCK_UNITS,
  MOCK_INCIDENTS,
  MOCK_TEAMS,
  UNIT_TYPE_ICON,
  CATEGORY_ICON,
} from '../../src/dispatcher-components/data';

describe('priorityClass', () => {
  it('CRITICAL → dp-badge-red', () => expect(priorityClass('CRITICAL')).toBe('dp-badge-red'));
  it('HIGH → dp-badge-red', () => expect(priorityClass('HIGH')).toBe('dp-badge-red'));
  it('MEDIUM → dp-badge-amber', () => expect(priorityClass('MEDIUM')).toBe('dp-badge-amber'));
  it('LOW → dp-badge-green', () => expect(priorityClass('LOW')).toBe('dp-badge-green'));
});

describe('statusClass', () => {
  it('New → dp-badge-red', () => expect(statusClass('New')).toBe('dp-badge-red'));
  it('Waiting → dp-badge-amber', () => expect(statusClass('Waiting')).toBe('dp-badge-amber'));
  it('Dispatched → dp-badge-blue', () => expect(statusClass('Dispatched')).toBe('dp-badge-blue'));
  it('In Progress → dp-badge-purple', () => expect(statusClass('In Progress')).toBe('dp-badge-purple'));
  it('Resolved → dp-badge-green', () => expect(statusClass('Resolved')).toBe('dp-badge-green'));
  it('Invalid → dp-badge-grey', () => expect(statusClass('Invalid')).toBe('dp-badge-grey'));
});

describe('situationClass', () => {
  it('Under Control → dp-badge-green', () => expect(situationClass('Under Control')).toBe('dp-badge-green'));
  it('Escalating → dp-badge-amber', () => expect(situationClass('Escalating')).toBe('dp-badge-amber'));
  it('Critical → dp-badge-red', () => expect(situationClass('Critical')).toBe('dp-badge-red'));
});

describe('situationColor', () => {
  it('Under Control → #2e7d32', () => expect(situationColor('Under Control')).toBe('#2e7d32'));
  it('Escalating → #c77700', () => expect(situationColor('Escalating')).toBe('#c77700'));
  it('Critical → #c62828', () => expect(situationColor('Critical')).toBe('#c62828'));
});

describe('unitStatusColor', () => {
  it('Available → #2e7d32', () => expect(unitStatusColor('Available')).toBe('#2e7d32'));
  it('On Route → #1565c0', () => expect(unitStatusColor('On Route')).toBe('#1565c0'));
  it('On Scene → #c62828', () => expect(unitStatusColor('On Scene')).toBe('#c62828'));
  it('Offline → #9e9e9e', () => expect(unitStatusColor('Offline')).toBe('#9e9e9e'));
});

describe('unitTypeColor', () => {
  it('FIRE → #c2440a', () => expect(unitTypeColor('FIRE')).toBe('#c2440a'));
  it('AMB → #1565c0', () => expect(unitTypeColor('AMB')).toBe('#1565c0'));
  it('POL → #5e35b1', () => expect(unitTypeColor('POL')).toBe('#5e35b1'));
});

describe('priorityColor', () => {
  it('CRITICAL → #c62828', () => expect(priorityColor('CRITICAL')).toBe('#c62828'));
  it('HIGH → #c2440a', () => expect(priorityColor('HIGH')).toBe('#c2440a'));
  it('MEDIUM → #c77700', () => expect(priorityColor('MEDIUM')).toBe('#c77700'));
  it('LOW → #2e7d32', () => expect(priorityColor('LOW')).toBe('#2e7d32'));
});

describe('MOCK_DISPATCHER', () => {
  it('has required identity fields', () => {
    expect(MOCK_DISPATCHER.id).toBeDefined();
    expect(MOCK_DISPATCHER.name).toBeDefined();
    expect(MOCK_DISPATCHER.badge).toBeDefined();
    expect(MOCK_DISPATCHER.email).toBeDefined();
  });
});

describe('MOCK_UNITS', () => {
  it('is non-empty', () => expect(MOCK_UNITS.length).toBeGreaterThan(0));
  it('each unit has id, type and status', () => {
    MOCK_UNITS.forEach((u) => {
      expect(u.id).toBeDefined();
      expect(u.type).toBeDefined();
      expect(u.status).toBeDefined();
    });
  });
});

describe('MOCK_INCIDENTS', () => {
  it('is non-empty', () => expect(MOCK_INCIDENTS.length).toBeGreaterThan(0));
  it('each incident has id, priority and status', () => {
    MOCK_INCIDENTS.forEach((inc) => {
      expect(inc.id).toBeDefined();
      expect(inc.priority).toBeDefined();
      expect(inc.status).toBeDefined();
    });
  });
});

describe('MOCK_TEAMS', () => {
  it('is non-empty', () => expect(MOCK_TEAMS.length).toBeGreaterThan(0));
  it('each team has id, type and status', () => {
    MOCK_TEAMS.forEach((t) => {
      expect(t.id).toBeDefined();
      expect(t.type).toBeDefined();
      expect(t.status).toBeDefined();
    });
  });
});

describe('UNIT_TYPE_ICON', () => {
  it('covers all unit types', () => {
    expect(UNIT_TYPE_ICON.FIRE).toBeDefined();
    expect(UNIT_TYPE_ICON.AMB).toBeDefined();
    expect(UNIT_TYPE_ICON.POL).toBeDefined();
  });
});

describe('CATEGORY_ICON', () => {
  it('covers all known categories', () => {
    expect(CATEGORY_ICON.FIRE).toBeDefined();
    expect(CATEGORY_ICON.AMB).toBeDefined();
    expect(CATEGORY_ICON.POL).toBeDefined();
    expect(CATEGORY_ICON.Other).toBeDefined();
  });
});
