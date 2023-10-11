import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PeopleFilters } from './PeopleFilters';
import { Loader } from './Loader';
import { PeopleTable } from './PeopleTable';
import { Person } from '../types';
import { getPeople } from '../api';
import { SortCategories } from '../types/sortCategoties';

export const PeoplePage = () => {
  const [people, setPeople] = useState<Person[]>([]);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query') || '';
  const centuries = searchParams.getAll('centuries') || '';
  const sex = searchParams.get('sex') || '';
  const order = searchParams.get('order') || null;
  const sort = searchParams.get('sort') || null;

  useEffect(() => {
    setIsLoading(true);

    getPeople()
      .then(setPeople)
      .catch(() => {
        setIsError(true);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const visiblePeople = useMemo(() => {
    let preparedPeople = people;

    if (query) {
      preparedPeople = preparedPeople.filter(
        person => person.name.toLowerCase().includes(query.toLowerCase().trim())
        || person.motherName?.toLowerCase().includes(query.toLowerCase().trim())
        || person.fatherName?.toLowerCase()
          .includes(query.toLowerCase().trim()),
      );
    }

    if (centuries.length > 0) {
      preparedPeople = preparedPeople.filter(person => (
        centuries.includes(Math.ceil(person.born / 100).toString())
      ));
    }

    if (sex) {
      preparedPeople = preparedPeople.filter(person => (
        person.sex === sex
      ));
    }

    if (sort) {
      preparedPeople = [...preparedPeople].sort((person1, person2) => {
        switch (sort) {
          case SortCategories.Name:
          case SortCategories.Sex:
            return person1[sort].localeCompare(person2[sort]);
          case SortCategories.Born:
          case SortCategories.Died:
            return person2[sort] - person1[sort];
          default:
            return 0;
        }
      });
    }

    if (order) {
      preparedPeople.reverse();
    }

    return preparedPeople;
  }, [people, query, centuries, sex, sort, order]);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      <h1 className="title">People Page</h1>

      <div className="block">
        <div className="columns is-desktop is-flex-direction-row-reverse">
          <div className="column is-7-tablet is-narrow-desktop">
            {people.length !== 0 && <PeopleFilters />}
          </div>

          <div className="column">
            <div className="box table-container">
              {isLoading && <Loader />}

              {isError
                && (
                  <p data-cy="peopleLoadingError" className="has-text-danger">
                    Something went wrong
                  </p>
                )}

              {!isLoading && people?.length === 0
                && (
                  <p data-cy="noPeopleMessage">
                    There are no people on the server
                  </p>
                )}

              {!visiblePeople.length && (
                <p data-cy="peopleLoadingError" className="has-text-danger">
                  Something went wrong
                </p>
              )}

              {people.length > 0
                && (
                  <PeopleTable people={visiblePeople} />)}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
