.PHONY: bootstrap lint typecheck test coverage build check

bootstrap:
	pnpm bootstrap

lint:
	pnpm lint

typecheck:
	pnpm typecheck

test:
	pnpm test

coverage:
	pnpm coverage

build:
	pnpm build

check:
	pnpm check
